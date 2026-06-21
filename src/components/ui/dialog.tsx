'use client'

import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DialogProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  description?: string
  children: React.ReactNode
}

export function Dialog({ isOpen, onClose, title, description, children }: DialogProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', handleEscape)
    }
    return () => {
      document.body.style.overflow = 'unset'
      window.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  if (!isOpen || !mounted) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      {/* Content Panel */}
      <div className="relative w-full max-w-md rounded-2xl glass-panel p-6 shadow-2xl border border-white/10 bg-slate-950/90 text-white z-10">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 hover:bg-white/10 opacity-70 hover:opacity-100 transition-colors cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>
        
        {title && <h3 className="text-lg font-bold leading-none tracking-tight mb-1 text-white">{title}</h3>}
        {description && <p className="text-sm text-gray-400 mb-4 font-sans">{description}</p>}
        
        <div className="mt-4">{children}</div>
      </div>
    </div>,
    document.body
  )
}
