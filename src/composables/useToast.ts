import { toast as vToast } from 'vue3-toastify'

/**
 * Thin adapter over vue3-toastify that preserves the toastr call shape used by
 * the original CRA app: `toastr.error(message, title)`.
 *
 * vue3-toastify expresses a title as part of the content object
 * (`toast.error({ title, content })`), so every ported call site can keep its
 * original two-argument form.
 */
type ToastFn = (message: string, title?: string) => void

export interface ToastApi {
  success: ToastFn
  error: ToastFn
  info: ToastFn
  warning: ToastFn
}

function body(message: string, title?: string): string | { title: string; content: string } {
  return title ? { title, content: message } : message
}

export const toast: ToastApi = {
  success: (message, title) => {
    vToast.success(body(message, title))
  },
  error: (message, title) => {
    vToast.error(body(message, title))
  },
  info: (message, title) => {
    vToast.info(body(message, title))
  },
  warning: (message, title) => {
    vToast.warning(body(message, title))
  },
}

export function useToast(): ToastApi {
  return toast
}
