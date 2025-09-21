import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from './prisma'
import CredentialsProvider from 'next-auth/providers/credentials'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt',
  },
  providers: [
    // Reddit OAuth Provider
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
    
    // Demo Login (Backup)
    CredentialsProvider({
      name: 'demo',
      credentials: {
        username: { label: 'Demo Username', type: 'text', placeholder: 'demo' }
      },
      async authorize(credentials) {
        if (credentials?.username === 'demo') {
          return {
            id: 'demo',
            name: 'Demo User',
            username: 'demouser',
            email: 'demo@reddit.local',
            karma: 1500,
          }
        }
        return null
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.username = user.username
        token.karma = user.karma || 0
      }
      if (account?.provider === 'reddit') {
        token.accessToken = account.access_token
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        session.user.username = token.username as string
        session.user.karma = token.karma as number
        session.accessToken = token.accessToken as string
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
}