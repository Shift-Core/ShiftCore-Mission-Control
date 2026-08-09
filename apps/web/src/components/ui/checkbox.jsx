import { Checkbox as CheckboxPrimitive } from '@base-ui/react/checkbox'
import { Check } from 'lucide-react'

import { cn } from '@/lib/utils'

function Checkbox({ className, ...props }) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        'peer size-5 shrink-0 rounded-md border border-[#9aa7bd] bg-white',
        'flex items-center justify-center outline-none',
        'transition-colors',
        'hover:border-[#0052cc]',
        'focus-visible:border-[#0052cc] focus-visible:ring-2 focus-visible:ring-[#0052cc]/20',
        'data-checked:border-[#0052cc] data-checked:bg-[#0052cc] data-checked:text-white',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        className="flex items-center justify-center text-current"
      >
        <Check className="size-4 stroke-[3]" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }