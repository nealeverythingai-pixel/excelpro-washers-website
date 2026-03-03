'use client'

import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

export function PinReveal({ pin }: { pin: string }) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="flex items-center gap-1.5">
      <div className="text-sm font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-600 dark:text-gray-300 min-w-[70px] text-center">
        {visible ? pin : '••••'}
      </div>
      <button
        onClick={() => setVisible(!visible)}
        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        title={visible ? 'Hide PIN' : 'Show PIN'}
      >
        {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  )
}
