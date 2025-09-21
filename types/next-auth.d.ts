import 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      username: string
      image?: string
      karma?: number
    }
    accessToken?: string
  }

  interface User {
    username: string
    karma?: number
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    username: string
    karma?: number
    accessToken?: string
  }
}
