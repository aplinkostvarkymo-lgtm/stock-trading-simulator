import { Clock } from 'lucide-react'
import TimeMachineSimulator from './TimeMachineSimulator'

export default function TimeMachinePage() {
  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <Clock className="w-8 h-8 text-accent-blue" />
          <h1 className="text-3xl font-bold text-terminal-text">Time Machine</h1>
        </div>
        <p className="text-terminal-muted">
          Travel back in time and see what your investment would be worth today
        </p>
      </div>

      <TimeMachineSimulator />
    </div>
  )
}

