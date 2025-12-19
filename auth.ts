import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import Credentials from 'next-auth/providers/credentials'
import Google from 'next-auth/providers/google'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { authConfig } from './auth.config'
import { prisma } from './lib/prisma'
import { env } from './lib/env'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export const { auth, signIn, signOut, handlers } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        // Validate input
        const validatedFields = loginSchema.safeParse(credentials)
        
        if (!validatedFields.success) {
          return null
        }

        const { email, password } = validatedFields.data

        // Find user by email
        const user = await prisma.user.findUnique({
          where: { email },
        })

        if (!user || !user.password) {
          return null
        }

        // Verify password
        const passwordMatch = await bcrypt.compare(password, user.password)

        if (!passwordMatch) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        }
      },
    }),
    Google({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
      }
      
      if (trigger === 'update' && session) {
        token = { ...token, ...session }
      }
      
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.email = token.email as string
        session.user.name = token.name as string
      }
      return session
    },
    async signIn({ user, account, profile }) {
      // For OAuth providers, ensure user has initial balance
      if (account?.provider === 'google') {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email! },
        })
        
        if (!existingUser) {
          // New Google user - will be created by adapter
          // We'll set initial balance after creation
          return true
        }
      }
      return true
    },
  },
  events: {
    async createUser({ user }) {
      // Set initial balance for new OAuth users
      const initialBalance = parseFloat(env.INITIAL_BALANCE || '100000')
      
      await prisma.user.update({
        where: { id: user.id },
        data: { balance: initialBalance },
      })
    },
  },
})

