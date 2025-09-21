import 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name?: string | null
      email: string
      username: string
      image?: string
      karma?: number
    }
    accessToken?: string
  }

  interface User {
    name?: string | null
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
