'use client'

import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

export function PinReveal({ pin }: { pin: string }) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="flex items-center gap-1.5">
      <div className="text-sm font-mono bg-zinc-800 px-2 py-1 rounded text-zinc-400 min-w-[70px] text-center">
        {visible ? pin : '••••'}
      </div>
      <button
        onClick={() => setVisible(!visible)}
        className="text-zinc-500 hover:text-zinc-300 transition-colors"
        title={visible ? 'Hide PIN' : 'Show PIN'}
      >
        {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  )
}
