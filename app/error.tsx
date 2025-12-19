'use client'

import { useEffect } from 'react'
import { AlertTriangle } from 'lucide-react'
import Button from '@/components/ui/Button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error to console in development
    console.error('Application error:', error)
    
    // In production, you could send to error tracking service
    // e.g., Sentry.captureException(error)
  }, [error])

  return (
    <div className="min-h-screen bg-terminal-bg flex items-center justify-center px-4">
      <div className="terminal-grid absolute inset-0 opacity-30" />
      
      <div className="relative max-w-md w-full">
        <div className="bg-terminal-surface border border-danger-red/30 rounded-xl p-8 text-center">
          <div className="bg-danger-red/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-danger-red" />
          </div>
          
          <h1 className="text-2xl font-bold text-terminal-text mb-2">
            Something went wrong!
          </h1>
          
          <p className="text-terminal-muted mb-6">
            {process.env.NODE_ENV === 'development'
              ? error.message
              : 'An unexpected error occurred. Please try again.'}
          </p>
          
          <div className="flex gap-3">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => window.location.href = '/'}
            >
              Go Home
            </Button>
            <Button
              variant="primary"
              className="flex-1"
              onClick={reset}
            >
              Try Again
            </Button>
          </div>
          
          {error.digest && (
            <p className="text-xs text-terminal-muted mt-4">
              Error ID: {error.digest}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

