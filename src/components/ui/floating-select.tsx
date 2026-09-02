import * as React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"
import { ChevronDown } from "lucide-react"
import { cn } from "../../lib/utils"

const ErrorIndicator = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 15C10.2833 15 10.5208 14.9042 10.7125 14.7125C10.9042 14.5208 11 14.2833 11 14C11 13.7167 10.9042 13.4792 10.7125 13.2875C10.5208 13.0958 10.2833 13 10 13C9.71667 13 9.47917 13.0958 9.2875 13.2875C9.09583 13.4792 9 13.7167 9 14C9 14.2833 9.09583 14.5208 9.2875 14.7125C9.47917 14.9042 9.71667 15 10 15ZM9 11H11V5H9V11ZM10 20C8.61667 20 7.31667 19.7375 6.1 19.2125C4.88333 18.6875 3.825 17.975 2.925 17.075C2.025 16.175 1.3125 15.1167 0.7875 13.9C0.2625 12.6833 0 11.3833 0 10C0 8.61667 0.2625 7.31667 0.7875 6.1C1.3125 4.88333 2.025 3.825 2.925 2.925C3.825 2.025 4.88333 1.3125 6.1 0.7875C7.31667 0.2625 8.61667 0 10 0C11.3833 0 12.6833 0.2625 13.9 0.7875C15.1167 1.3125 16.175 2.025 17.075 2.925C17.975 3.825 18.6875 4.88333 19.2125 6.1C19.7375 7.31667 20 8.61667 20 10C20 11.3833 19.7375 12.6833 19.2125 13.9C18.6875 15.1167 17.975 16.175 17.075 17.075C16.175 17.975 15.1167 18.6875 13.9 19.2125C12.6833 19.7375 11.3833 20 10 20Z" fill="#910822"/>
  </svg>
)

export interface FloatingSelectProps {
  label: React.ReactNode
  error?: boolean
  value?: string | undefined
  onValueChange?: (value: string) => void
  children: React.ReactNode
  className?: string
}

const FloatingSelect: React.FC<FloatingSelectProps> = ({
  label,
  error,
  value,
  onValueChange,
  children,
  className,
}) => {
  const [open, setOpen] = React.useState(false)
  const [focused, setFocused] = React.useState(false)

  const hasValue = value !== undefined && value !== null && value !== ''
  // Float the label whenever there's a value, the trigger is focused, or the
  // dropdown is open — driven by real state rather than CSS peer/group
  // selectors, since the label isn't a direct sibling of the Trigger.
  const floated = hasValue || focused || open

  const labelColorClass = error
    ? "text-om-error"
    : focused || open
    ? "text-om-green"
    : hasValue
    ? "text-gray-700"
    : "text-gray-500"

  return (
    <div className="relative">
      <SelectPrimitive.Root
        value={hasValue ? value : undefined}
        onValueChange={onValueChange}
        open={open}
        onOpenChange={setOpen}
      >
        <SelectPrimitive.Trigger
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={cn(
            "group flex h-12 w-full items-center justify-between rounded-lg border bg-white text-sm text-gray-900 outline-none transition-colors",
            "focus:ring-2 focus:ring-offset-0",
            error
              ? "border-om-error focus:border-om-error focus:ring-om-error/30"
              : "border-gray-300 focus:border-om-green focus:ring-om-green/30",
            className
          )}
        >
          <span className="flex-1 truncate pl-3 text-left">
            <SelectPrimitive.Value placeholder=" " />
          </span>
          <div className="flex items-center gap-1.5 pr-3">
            {error && <ErrorIndicator />}
            <SelectPrimitive.Icon asChild>
              <ChevronDown className="h-4 w-4 shrink-0 opacity-50 transition-transform duration-200 group-data-[state=open]:rotate-180" />
            </SelectPrimitive.Icon>
          </div>
        </SelectPrimitive.Trigger>
        <SelectPrimitive.Portal>
          <SelectPrimitive.Content
            className="relative z-50 max-h-96 w-[var(--radix-select-trigger-width)] min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-lg border border-gray-200 bg-white text-gray-700 shadow-lg"
            position="popper"
            sideOffset={4}
          >
            <SelectPrimitive.Viewport className="p-1">
              {children}
            </SelectPrimitive.Viewport>
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>

      <label
        className={cn(
          "pointer-events-none absolute left-3 bg-white px-1 text-sm transition-all duration-200",
          floated ? "top-0 -translate-y-1/2 text-xs" : "top-1/2 -translate-y-1/2",
          labelColorClass
        )}
      >
        {label}
      </label>
    </div>
  )
}

FloatingSelect.displayName = "FloatingSelect"

export { FloatingSelect }