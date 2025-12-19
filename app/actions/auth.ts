'use server'

import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { signIn } from '@/auth'
import { AuthError } from 'next-auth'
import { env } from '@/lib/env'

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

interface ActionResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  errors?: Record<string, string[]>
}

/**
 * Register new user
 */
export async function signup(formData: FormData): Promise<ActionResponse> {
  try {
    const rawData = {
      name: formData.get('name'),
      email: formData.get('email'),
      password: formData.get('password'),
      confirmPassword: formData.get('confirmPassword'),
    }

    // Validate input
    const validated = signupSchema.parse(rawData)

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validated.email },
    })

    if (existingUser) {
      return {
        success: false,
        error: 'An account with this email already exists',
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validated.password, 10)

    // Create user with initial balance
    const initialBalance = parseFloat(env.INITIAL_BALANCE || '100000')
    
    await prisma.user.create({
      data: {
        name: validated.name,
        email: validated.email,
        password: hashedPassword,
        balance: initialBalance,
      },
    })

    // Auto sign-in after registration
    await signIn('credentials', {
      email: validated.email,
      password: validated.password,
      redirect: false,
    })

    return {
      success: true,
      data: { message: 'Account created successfully' },
    }
  } catch (error) {
    console.error('Signup error:', error)

    if (error instanceof z.ZodError) {
      const errors: Record<string, string[]> = {}
      error.errors.forEach((err) => {
        const path = err.path[0] as string
        if (!errors[path]) {
          errors[path] = []
        }
        errors[path].push(err.message)
      })
      return { success: false, errors }
    }

    if (error instanceof Error) {
      return { success: false, error: error.message }
    }

    return { success: false, error: 'Failed to create account' }
  }
}

/**
 * Sign in with credentials
 */
export async function loginWithCredentials(formData: FormData): Promise<ActionResponse> {
  try {
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    if (!email || !password) {
      return { success: false, error: 'Email and password are required' }
    }

    await signIn('credentials', {
      email,
      password,
      redirectTo: '/dashboard',
    })

    return { success: true }
  } catch (error) {
    console.error('Login error:', error)

    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return { success: false, error: 'Invalid email or password' }
        default:
          return { success: false, error: 'Something went wrong' }
      }
    }

    throw error
  }
}

/**
 * Sign in with Google OAuth
 */
export async function loginWithGoogle() {
  await signIn('google', { redirectTo: '/dashboard' })
}

