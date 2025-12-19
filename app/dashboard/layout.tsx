import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth, signOut } from '@/auth'
import { getUserBalance } from '@/app/actions/trade'
import { LayoutDashboard, TrendingUp, History, Star, LogOut, DollarSign, Clock } from 'lucide-react'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  
  if (!session?.user) {
    redirect('/auth/signin')
  }

  const balanceResult = await getUserBalance()
  const balance: number = balanceResult.success && balanceResult.data !== undefined ? balanceResult.data : 0

  return (
    <div className="min-h-screen bg-terminal-bg flex">
      {/* Sidebar */}
      <aside className="w-64 bg-terminal-surface border-r border-terminal-border flex flex-col">
        {/* Logo/Brand */}
        <div className="p-6 border-b border-terminal-border">
          <Link href="/dashboard" className="flex items-center gap-2">
            <TrendingUp className="w-8 h-8 text-accent-blue" />
            <div>
              <h1 className="text-xl font-bold text-terminal-text">TradeSim</h1>
              <p className="text-xs text-terminal-muted">Stock Simulator</p>
            </div>
          </Link>
        </div>

        {/* Balance Display */}
        <div className="p-6 border-b border-terminal-border bg-terminal-bg/50">
          <p className="text-xs text-terminal-muted mb-1">Cash Balance</p>
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-success-green" />
            <p className="text-2xl font-bold text-success-green">
              ${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          <NavLink href="/dashboard" icon={<LayoutDashboard className="w-5 h-5" />}>
            Dashboard
          </NavLink>
          <NavLink href="/dashboard/portfolio" icon={<TrendingUp className="w-5 h-5" />}>
            Portfolio
          </NavLink>
          <NavLink href="/dashboard/trade" icon={<DollarSign className="w-5 h-5" />}>
            Trade
          </NavLink>
          <NavLink href="/dashboard/transactions" icon={<History className="w-5 h-5" />}>
            Transactions
          </NavLink>
          <NavLink href="/dashboard/watchlist" icon={<Star className="w-5 h-5" />}>
            Watchlist
          </NavLink>
          <NavLink href="/dashboard/time-machine" icon={<Clock className="w-5 h-5" />}>
            Time Machine
          </NavLink>
        </nav>

        {/* User Info & Sign Out */}
        <div className="p-4 border-t border-terminal-border">
          <div className="flex items-center gap-3 mb-3">
            {session.user.image ? (
              <img
                src={session.user.image}
                alt={session.user.name || 'User'}
                className="w-10 h-10 rounded-full border-2 border-accent-blue"
              />
            ) : (
              <div className="w-10 h-10 bg-accent-blue rounded-full flex items-center justify-center text-white font-bold">
                {session.user.name?.[0]?.toUpperCase() || 'U'}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-terminal-text truncate">
                {session.user.name || 'User'}
              </p>
              <p className="text-xs text-terminal-muted truncate">
                {session.user.email}
              </p>
            </div>
          </div>
          <form
            action={async () => {
              'use server'
              await signOut({ redirectTo: '/' })
            }}
          >
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-terminal-bg hover:bg-terminal-border text-terminal-text rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto p-8">
          {children}
        </div>
      </main>
    </div>
  )
}

function NavLink({ href, icon, children }: { href: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-4 py-3 text-terminal-text hover:bg-terminal-bg rounded-lg transition-colors group"
    >
      <span className="text-terminal-muted group-hover:text-accent-blue transition-colors">
        {icon}
      </span>
      <span className="font-medium">{children}</span>
    </Link>
  )
}

