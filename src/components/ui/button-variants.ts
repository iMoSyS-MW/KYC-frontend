import { cva } from 'class-variance-authority'
import type { ButtonSize, ButtonVariant } from './types'

export const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-semibold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-om-green text-primary-foreground hover:bg-om-dark',
        destructive: 'bg-om-error text-destructive-foreground hover:bg-om-error/90',
        outline:
          'border-2 border-om-green bg-background text-om-green hover:bg-om-tertiary hover:border-om-light hover:text-om-light',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      } satisfies Record<ButtonVariant, string>,
      size: {
        default: 'h-10 px-6 py-2',
        sm: 'h-9 rounded-full px-4',
        lg: 'h-11 rounded-full px-8',
        icon: 'h-10 w-10',
      } satisfies Record<ButtonSize, string>,
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)
