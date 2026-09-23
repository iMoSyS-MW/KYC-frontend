import { inject } from 'vue'
import { ConfirmKey, type ConfirmApi } from '../plugins/confirm'

export function useConfirm(): ConfirmApi {
  const api = inject(ConfirmKey)
  if (!api) {
    throw new Error('useConfirm() must be used after app.use(confirmPlugin)')
  }
  return api
}
