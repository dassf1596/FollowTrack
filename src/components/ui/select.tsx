import React from 'react'
import { cn } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div className="relative w-full">
        <select
          ref={ref}
          className={cn(
            "w-full h-11 rounded-xl px-4 py-2 text-sm transition-all focus-visible:outline-none appearance-none glass-input font-sans cursor-pointer pr-10 text-white",
            className
          )}
          {...props}
        >
          {children}
        </select>
        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400">
          <ChevronDown className="h-4 w-4" />
        </div>
      </div>
    )
  }
)
Select.displayName = 'Select'
