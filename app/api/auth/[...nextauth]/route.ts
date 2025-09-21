import NextAuth from 'next-auth'
import type { NextAuthOptions } from 'next-auth'

const authOptions: NextAuthOptions = {
  providers: [
    {
      id: 'reddit',
      name: 'Reddit',
      type: 'oauth',
      authorization: {
        url: 'https://www.reddit.com/api/v1/authorize',
        params: {
          scope: 'identity read',
          duration: 'permanent',
        },
      },
      token: 'https://www.reddit.com/api/v1/access_token',
      userinfo: 'https://oauth.reddit.com/api/v1/me',
      clientId: process.env.REDDIT_CLIENT_ID,
      clientSecret: process.env.REDDIT_CLIENT_SECRET,
      profile(profile: any) {
        return {
          id: profile.id,
          name: profile.name,
          username: profile.name,
          email: `${profile.name}@reddit.local`,
          image: profile.icon_img?.split('?')[0] || null,
          karma: profile.total_karma || 0,
        }
      },
    },
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.username = (user as any).username
        token.karma = (user as any).karma || 0
      }
      if (account?.provider === 'reddit') {
        token.accessToken = account.access_token
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        (session.user as any).id = token.sub!
        ;(session.user as any).username = token.username as string
        ;(session.user as any).karma = token.karma as number
        ;(session as any).accessToken = token.accessToken as string
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
