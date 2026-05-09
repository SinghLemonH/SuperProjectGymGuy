import { forwardRef, type InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, id, className = '', ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className="flex flex-col gap-1 w-full">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-gray-600">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={[
            'w-full rounded-lg border px-3 py-2 text-sm text-gray-900 bg-white outline-none',
            'placeholder:text-gray-400 transition-all duration-150',
            'focus:ring-2 focus:ring-[#534AB7]/25 focus:border-[#534AB7]',
            'disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed',
            error
              ? 'border-[#A32D2D] focus:ring-red-100 focus:border-[#A32D2D]'
              : 'border-gray-200 hover:border-gray-300',
            className,
          ].join(' ')}
          {...props}
        />
        {error && (
          <p className="text-xs text-[#A32D2D] flex items-center gap-1">
            <svg className="w-3 h-3 flex-shrink-0" viewBox="0 0 12 12" fill="currentColor">
              <path d="M6 1a5 5 0 100 10A5 5 0 006 1zm-.5 2.5h1v4h-1v-4zm0 5h1v1h-1v-1z" />
            </svg>
            {error}
          </p>
        )}
        {hint && !error && <p className="text-xs text-gray-400">{hint}</p>}
      </div>
    )
  }
)
Input.displayName = 'Input'
export default Input
