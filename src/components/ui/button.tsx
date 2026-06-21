import React from 'react'
import { cn } from '@/lib/utils'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  isLoading?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', isLoading, children, ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center rounded-xl text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] cursor-pointer",
          // Variants
          variant === 'default' && "bg-indigo-600 text-white hover:bg-indigo-500 shadow-md hover:shadow-indigo-500/20",
          variant === 'destructive' && "bg-rose-600 text-white hover:bg-rose-500 shadow-md hover:shadow-rose-500/20",
          variant === 'outline' && "border border-white/10 bg-transparent hover:bg-white/5 text-gray-200",
          variant === 'secondary' && "bg-white/10 text-white hover:bg-white/15 border border-white/5",
          variant === 'ghost' && "hover:bg-white/5 text-gray-300 hover:text-white",
          variant === 'link' && "text-indigo-400 underline-offset-4 hover:underline bg-transparent p-0",
          // Sizes
          size === 'default' && "h-11 px-5 py-2",
          size === 'sm' && "h-9 px-3 rounded-lg text-xs",
          size === 'lg' && "h-12 px-8 text-base",
          size === 'icon' && "h-10 w-10 p-0",
          className
        )}
        ref={ref}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading ? (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : null}
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'
