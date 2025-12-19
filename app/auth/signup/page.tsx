import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import SignUpForm from './SignUpForm'

export default async function SignUpPage() {
  // Redirect if already authenticated
  const session = await auth()
  if (session?.user) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-terminal-bg flex items-center justify-center px-4 py-12">
      <div className="terminal-grid absolute inset-0 opacity-30" />
      
      <div className="relative w-full max-w-md">
        <div className="bg-terminal-surface border border-terminal-border rounded-xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-terminal-text mb-2">
              Create Account
            </h1>
            <p className="text-terminal-muted">
              Start trading with $100,000 virtual capital
            </p>
          </div>

          <SignUpForm />

          <div className="mt-6 text-center">
            <p className="text-terminal-muted">
              Already have an account?{' '}
              <Link
                href="/auth/signin"
                className="text-accent-blue hover:underline font-semibold"
              >
                Sign in
              </Link>
            </p>
          </div>

          <div className="mt-6 text-center">
            <Link
              href="/"
              className="text-terminal-muted hover:text-terminal-text transition-colors text-sm"
            >
              ← Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

