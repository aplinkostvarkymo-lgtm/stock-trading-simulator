import Link from 'next/link'
import { Home, Search } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-terminal-bg flex items-center justify-center px-4">
      <div className="terminal-grid absolute inset-0 opacity-30" />
      
      <div className="relative max-w-md w-full text-center">
        <div className="bg-terminal-surface border border-terminal-border rounded-xl p-12">
          {/* 404 Display */}
          <div className="mb-6">
            <div className="text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-accent-blue to-success-green">
              404
            </div>
            <h1 className="text-2xl font-bold text-terminal-text mt-4 mb-2">
              Page Not Found
            </h1>
            <p className="text-terminal-muted">
              The page you're looking for doesn't exist or has been moved.
            </p>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-col gap-3">
            <Link
              href="/dashboard"
              className="flex items-center justify-center gap-2 px-6 py-3 bg-accent-blue hover:bg-blue-600 text-white font-semibold rounded-lg transition-all"
            >
              <Home className="w-5 h-5" />
              Back to Dashboard
            </Link>
            <Link
              href="/dashboard/trade"
              className="flex items-center justify-center gap-2 px-6 py-3 bg-terminal-bg hover:bg-terminal-border text-terminal-text font-semibold rounded-lg border border-terminal-border transition-all"
            >
              <Search className="w-5 h-5" />
              Search Stocks
            </Link>
          </div>
        </div>

        {/* Terminal-styled footer */}
        <div className="mt-6 text-center">
          <p className="text-terminal-muted text-sm font-mono">
            Error: ENOENT - resource not found
          </p>
        </div>
      </div>
    </div>
  )
}

