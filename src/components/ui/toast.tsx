'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

export type ToastVariant = 'default' | 'success' | 'destructive' | 'info'

export interface ToastMessage {
  id: string
  title?: string
  description: string
  variant?: ToastVariant
  duration?: number
}

interface ToastContextType {
  toast: (message: Omit<ToastMessage, 'id'>) => void
  dismiss: (id: string) => void
  toasts: ToastMessage[]
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = useCallback(({ title, description, variant = 'default', duration = 4000 }: Omit<ToastMessage, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts((prev) => [...prev, { id, title, description, variant, duration }])

    if (duration > 0) {
      setTimeout(() => {
        dismiss(id)
      }, duration)
    }
  }, [dismiss])

  return (
    <ToastContext.Provider value={{ toast, dismiss, toasts }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md w-full sm:w-[380px]">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "flex items-start gap-3 p-4 rounded-xl shadow-lg border transition-all duration-300 transform translate-y-0 scale-100 animate-slide-in",
              t.variant === 'success' && "bg-emerald-950/80 border-emerald-500/30 text-emerald-200",
              t.variant === 'destructive' && "bg-rose-950/80 border-rose-500/30 text-rose-200",
              t.variant === 'info' && "bg-indigo-950/80 border-indigo-500/30 text-indigo-200",
              t.variant === 'default' && "bg-slate-900/80 border-slate-700/50 text-slate-200",
              "backdrop-blur-md"
            )}
          >
            <div className="mt-0.5 shrink-0">
              {t.variant === 'success' && <CheckCircle className="h-5 w-5 text-emerald-400" />}
              {t.variant === 'destructive' && <AlertCircle className="h-5 w-5 text-rose-400" />}
              {t.variant === 'info' && <Info className="h-5 w-5 text-indigo-400" />}
              {t.variant === 'default' && <Info className="h-5 w-5 text-slate-400" />}
            </div>
            <div className="flex-1 space-y-1">
              {t.title && <h4 className="font-semibold text-sm text-white">{t.title}</h4>}
              <p className="text-xs opacity-90">{t.description}</p>
            </div>
            <button
              onClick={() => dismiss(t.id)}
              className="shrink-0 p-0.5 rounded-lg hover:bg-white/10 opacity-70 hover:opacity-100 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}
