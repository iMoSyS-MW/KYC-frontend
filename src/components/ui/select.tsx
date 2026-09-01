"use client"

import * as React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"
import { Check, ChevronDown, Search, AlertCircle } from "lucide-react"
import { cn } from "../../lib/utils"

const Select = SelectPrimitive.Root
const SelectGroup = SelectPrimitive.Group
const SelectValue = SelectPrimitive.Value

/** Decorative checkbox-style icon shown on each SelectItem (from Figma) */
const ItemCheckboxIcon = ({ className }: { className?: string }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <mask
      id="mask0_101_896"
      style={{ maskType: "alpha" }}
      maskUnits="userSpaceOnUse"
      x="-1"
      y="-1"
      width="25"
      height="25"
    >
      <rect x="-0.251953" y="-0.351562" width="24" height="24" fill="#E6E6E6" />
    </mask>
    <g mask="url(#mask0_101_896)">
      <path
        d="M4.74805 18.6484V20.6484C4.19805 20.6484 3.72721 20.4526 3.33555 20.0609C2.94388 19.6693 2.74805 19.1984 2.74805 18.6484H4.74805ZM2.74805 16.6484V14.6484H4.74805V16.6484H2.74805ZM2.74805 12.6484V10.6484H4.74805V12.6484H2.74805ZM2.74805 8.64844V6.64844H4.74805V8.64844H2.74805ZM4.74805 4.64844H2.74805C2.74805 4.09844 2.94388 3.6276 3.33555 3.23594C3.72721 2.84427 4.19805 2.64844 4.74805 2.64844V4.64844ZM6.74805 20.6484V18.6484H8.74805V20.6484H6.74805ZM6.74805 4.64844V2.64844H8.74805V4.64844H6.74805ZM10.748 20.6484V18.6484H12.748V20.6484H10.748ZM10.748 4.64844V2.64844H12.748V4.64844H10.748ZM14.748 20.6484V18.6484H16.748V20.6484H14.748ZM14.748 4.64844V2.64844H16.748V4.64844H14.748ZM18.748 18.6484H20.748C20.748 19.1984 20.5522 19.6693 20.1605 20.0609C19.7689 20.4526 19.298 20.6484 18.748 20.6484V18.6484ZM18.748 16.6484V14.6484H20.748V16.6484H18.748ZM18.748 12.6484V10.6484H20.748V12.6484H18.748ZM18.748 8.64844V6.64844H20.748V8.64844H18.748ZM18.748 4.64844V2.64844C19.298 2.64844 19.7689 2.84427 20.1605 3.23594C20.5522 3.6276 20.748 4.09844 20.748 4.64844H18.748Z"
        fill="currentColor"
      />
    </g>
  </svg>
)

interface SelectTriggerProps
  extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger> {
  /** Puts the trigger in its error state: red border + inline error icon */
  error?: boolean
  /** Optional custom icon to show when `error` is true (defaults to lucide AlertCircle) */
  errorIcon?: React.ReactNode
}

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  SelectTriggerProps
>(({ className, children, error, errorIcon, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      "group flex h-10 w-full items-center justify-between rounded-lg border bg-background px-3 py-2 text-sm ring-offset-background transition-colors placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
      error
        ? "border-om-error focus:ring-om-error/30"
        : "border-gray-300 focus:border-blue-500 focus:ring-blue-500/30 data-[state=open]:border-om-green data-[state=open]:ring-0",
      className
    )}
    {...props}
  >
    {children}
    <div className="flex items-center gap-1.5">
      {error && (errorIcon ?? <AlertCircle className="h-4 w-4 shrink-0 fill-om-error text-white" />)}
      <SelectPrimitive.Icon asChild>
        <ChevronDown className="h-4 w-4 shrink-0 opacity-50 transition-transform duration-200 group-data-[state=open]:rotate-180" />
      </SelectPrimitive.Icon>
    </div>
  </SelectPrimitive.Trigger>
))
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName

interface SelectContentProps
  extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content> {
  /** Shows the search input at the top of the dropdown (default: true) */
  searchable?: boolean
  searchPlaceholder?: string
}

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  SelectContentProps
>(
  (
    {
      className,
      children,
      position = "popper",
      searchable = true,
      searchPlaceholder = "Type to search...",
      ...props
    },
    ref
  ) => {
    const [query, setQuery] = React.useState("")

    const filteredChildren = React.useMemo(() => {
      if (!searchable || !query.trim()) return children
      return React.Children.toArray(children).filter((child) => {
        if (!React.isValidElement(child)) return true
        const element = child as React.ReactElement<{ children?: React.ReactNode }>
        const text =
          typeof element.props.children === "string" ? element.props.children : ""
        return text.toLowerCase().includes(query.trim().toLowerCase())
      })
    }, [children, query, searchable])

    return (
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          ref={ref}
          className={cn(
            "relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-lg border border-gray-200 bg-popover text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
            position === "popper" &&
              "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
            className
          )}
          position={position}
          {...props}
        >
          {searchable && (
            <div className="sticky top-0 z-10 bg-popover p-2">
              <div className="flex items-center gap-2 rounded-md border border-gray-200 bg-gray-50 px-3 py-2">
                <Search className="h-4 w-4 shrink-0 text-gray-400" />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={searchPlaceholder}
                  onKeyDown={(e) => {
                    // Let Escape still close the dropdown; stop everything else
                    // from being swallowed by Radix's built-in type-ahead.
                    if (e.key !== "Escape") e.stopPropagation()
                  }}
                  className="w-full bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400"
                />
              </div>
            </div>
          )}
          <SelectPrimitive.Viewport
            className={cn(
              "p-1",
              position === "popper" &&
                "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
            )}
          >
            {filteredChildren}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    )
  }
)
SelectContent.displayName = SelectPrimitive.Content.displayName

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "group relative flex w-full cursor-pointer select-none items-center justify-between gap-2 rounded-md py-2.5 pl-2 pr-2 text-sm text-gray-700 outline-none transition-colors data-[highlighted]:bg-gray-50 data-[state=checked]:bg-om-green/10 data-[state=checked]:text-gray-900 data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}
  >
    <span className="flex items-center gap-2.5">
      <ItemCheckboxIcon className="h-4 w-4 shrink-0 text-gray-300 group-data-[state=checked]:text-om-green" />
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </span>
    <SelectPrimitive.ItemIndicator>
      <Check className="h-4 w-4 shrink-0 text-om-green" />
    </SelectPrimitive.ItemIndicator>
  </SelectPrimitive.Item>
))
SelectItem.displayName = SelectPrimitive.Item.displayName

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectItem,
}