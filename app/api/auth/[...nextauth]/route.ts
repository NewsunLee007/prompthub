import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import CredentialsProvider from "next-auth/providers/credentials"

const handler = NextAuth({
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        name: { label: "Name", type: "text" },
      },
      async authorize(credentials) {
        console.log("Authorize called with:", credentials?.email)
        
        if (!credentials?.email) {
          console.log("No email provided")
          return null
        }
        
        try {
          console.log("Checking database connection...")
          // 测试数据库连接
          await prisma.$connect()
          console.log("Database connected")
          
          // 使用 findFirst 替代 findUnique 避免潜在问题
          console.log("Looking for user:", credentials.email)
          let user = await prisma.user.findFirst({
            where: { email: credentials.email }
          })
          
          if (!user) {
            console.log("User not found, creating new user")
            user = await prisma.user.create({
              data: {
                email: credentials.email,
                name: credentials.name || credentials.email.split('@')[0],
              }
            })
            console.log("User created:", user.id)
          } else {
            console.log("User found:", user.id)
          }
          
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
          }
        } catch (error) {
          console.error("Auth error details:", error)
          throw new Error("Database connection failed: " + (error as Error).message)
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.id as string
      }
      return session
    }
  },
  debug: true, // Enable debug in production to see logs
})

export { handler as GET, handler as POST }
