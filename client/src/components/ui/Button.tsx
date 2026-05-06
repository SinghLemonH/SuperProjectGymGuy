import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'outline' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  children: ReactNode
}

const variantClass: Record<Variant, string> = {
  primary: 'bg-[#534AB7] text-white border-[#534AB7] hover:bg-[#3C3489] hover:border-[#3C3489]',
  outline: 'bg-transparent text-[#534AB7] border-[#534AB7] hover:bg-[#EEEDFE]',
  ghost:   'bg-transparent text-gray-500 border-transparent hover:bg-gray-100 hover:text-gray-900',
  danger:  'bg-[#A32D2D] text-white border-[#A32D2D] hover:bg-[#791F1F]',
}

const sizeClass: Record<Size, string> = {
  sm: 'text-xs px-3 py-1.5 rounded-md',
  md: 'text-sm px-4 py-2 rounded-lg',
  lg: 'text-base px-5 py-2.5 rounded-lg',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  children,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={[
        'inline-flex items-center justify-center gap-2 font-medium border',
        'transition-all duration-150 active:scale-[0.98] cursor-pointer',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100',
        variantClass[variant],
        sizeClass[size],
        className,
      ].join(' ')}
    >
      {loading && (
        <svg className="animate-spin w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      )}
      {children}
    </button>
  )
}
