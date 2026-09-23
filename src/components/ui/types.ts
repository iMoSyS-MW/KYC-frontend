import type { Ref } from 'vue'

export type ButtonVariant =
  | 'default'
  | 'destructive'
  | 'outline'
  | 'secondary'
  | 'ghost'
  | 'link'

export type ButtonSize = 'default' | 'sm' | 'lg' | 'icon'

export interface ButtonProps {
  variant?: ButtonVariant | null
  size?: ButtonSize | null
  asChild?: boolean
  class?: string
}

export interface InputProps {
  class?: string
  type?: string
}

export interface LabelProps {
  class?: string
  for?: string
}

export interface CheckboxProps {
  class?: string
  disabled?: boolean
  id?: string
  name?: string
  required?: boolean
  value?: string | number
}

export interface RadioGroupProps {
  class?: string
  disabled?: boolean
  name?: string
  required?: boolean
  orientation?: 'horizontal' | 'vertical'
  loop?: boolean
}

export interface RadioGroupItemProps {
  class?: string
  value: string | number
  disabled?: boolean
  id?: string
  name?: string
  required?: boolean
}

export interface SelectProps {
  defaultValue?: string
  defaultOpen?: boolean
  disabled?: boolean
  name?: string
  required?: boolean
  autocomplete?: string
  dir?: 'ltr' | 'rtl'
}

export interface SelectTriggerProps {
  class?: string
  error?: boolean
  disabled?: boolean
}

export interface SelectContentProps {
  class?: string
  position?: 'popper' | 'item-aligned'
  searchable?: boolean
  searchPlaceholder?: string
}

export interface SelectItemProps {
  class?: string
  value: string
  disabled?: boolean
  textValue?: string
}

export interface SelectValueProps {
  class?: string
  placeholder?: string
}

export interface SelectLabelProps {
  class?: string
}

export interface FloatingInputProps {
  label: string
  error?: boolean
  showPasswordToggle?: boolean
  class?: string
  id?: string
  type?: string
}

export interface FloatingTextareaProps {
  label: string
  error?: boolean
  class?: string
  id?: string
  rows?: number
}

export interface FloatingSelectProps {
  label: string
  error?: boolean
  class?: string
}

export interface FloatingDateProps {
  label: string
  error?: boolean
  id?: string
  class?: string
}

export interface FileSelections {
  [key: string]: File | null
}

export interface FileInputRefs {
  [key: string]: Ref<HTMLInputElement | null>
}

export interface FileUploadAreaProps {
  label: string
  field: string
  error?: string
  fileSelections: FileSelections
  multiple?: boolean
  maxSizeMB?: number
}

export interface SuccessModalProps {
  open: boolean
  title?: string
  message: string
}

export interface ValidationErrorBannerProps {
  message: string
  stepName?: string
}
