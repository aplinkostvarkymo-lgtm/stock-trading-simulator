import Link from 'next/link'
import { TrendingUp, Shield, Zap, BarChart3 } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-terminal-bg">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="terminal-grid absolute inset-0 opacity-50" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold text-terminal-text mb-6">
              Stock Trading
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-accent-blue to-success-green">
                Simulator
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-terminal-muted max-w-3xl mx-auto mb-12">
              Master the art of trading with real-time market data. Practice risk-free with $100,000 virtual capital.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/auth/signup"
                className="px-8 py-4 bg-accent-blue hover:bg-blue-600 text-white font-semibold rounded-lg transition-all glow-blue"
              >
                Start Trading
              </Link>
              <Link
                href="/auth/signin"
                className="px-8 py-4 bg-terminal-surface hover:bg-terminal-border text-terminal-text font-semibold rounded-lg border border-terminal-border transition-all"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-terminal-text mb-16">
          Professional Trading Platform
        </h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-terminal-surface border border-terminal-border rounded-lg p-6 hover:border-accent-blue transition-colors">
            <div className="bg-accent-blue/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-accent-blue" />
            </div>
            <h3 className="text-xl font-semibold text-terminal-text mb-2">
              Real-Time Data
            </h3>
            <p className="text-terminal-muted">
              Access live stock prices and market data from TwelveData API
            </p>
          </div>

          <div className="bg-terminal-surface border border-terminal-border rounded-lg p-6 hover:border-success-green transition-colors">
            <div className="bg-success-green/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-success-green" />
            </div>
            <h3 className="text-xl font-semibold text-terminal-text mb-2">
              Risk-Free Practice
            </h3>
            <p className="text-terminal-muted">
              Learn trading strategies without risking real money
            </p>
          </div>

          <div className="bg-terminal-surface border border-terminal-border rounded-lg p-6 hover:border-warning-yellow transition-colors">
            <div className="bg-warning-yellow/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-warning-yellow" />
            </div>
            <h3 className="text-xl font-semibold text-terminal-text mb-2">
              Instant Execution
            </h3>
            <p className="text-terminal-muted">
              Buy and sell stocks instantly with real-time balance updates
            </p>
          </div>

          <div className="bg-terminal-surface border border-terminal-border rounded-lg p-6 hover:border-danger-red transition-colors">
            <div className="bg-danger-red/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <BarChart3 className="w-6 h-6 text-danger-red" />
            </div>
            <h3 className="text-xl font-semibold text-terminal-text mb-2">
              Portfolio Analytics
            </h3>
            <p className="text-terminal-muted">
              Track your performance with detailed charts and metrics
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="bg-gradient-to-r from-accent-blue to-success-green rounded-2xl p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Start Trading?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of traders mastering the stock market. Start with $100,000 virtual capital today.
          </p>
          <Link
            href="/auth/signup"
            className="inline-block px-8 py-4 bg-white text-accent-blue font-semibold rounded-lg hover:bg-gray-100 transition-all"
          >
            Create Free Account
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-terminal-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <p className="text-center text-terminal-muted">
            © 2024 Stock Trading Simulator. Built with Next.js 15 & TwelveData API.
          </p>
        </div>
      </footer>
    </div>
  )
}

