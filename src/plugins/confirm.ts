import type { App, InjectionKey, Ref } from 'vue'
import { ref } from 'vue'

export type ConfirmationTone = 'primary' | 'success' | 'warning' | 'danger'

export interface ConfirmationOptions {
  title?: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  tone?: ConfirmationTone
  hideCancel?: boolean
}

export interface ConfirmationDialogState {
  open: boolean
  title: string
  message: string
  confirmLabel: string
  cancelLabel: string
  tone: ConfirmationTone
  hideCancel: boolean
  resolver: ((confirmed: boolean) => void) | null
}

export interface ConfirmApi {
  confirm: (options: ConfirmationOptions) => Promise<boolean>
  notify: (options: ConfirmationOptions) => Promise<boolean>
  state: Ref<ConfirmationDialogState>
  close: (confirmed: boolean) => void
}

export const ConfirmKey: InjectionKey<ConfirmApi> = Symbol('confirm')

function defaultState(): ConfirmationDialogState {
  return {
    open: false,
    title: 'Please confirm',
    message: '',
    confirmLabel: 'Confirm',
    cancelLabel: 'Cancel',
    tone: 'warning',
    hideCancel: false,
    resolver: null,
  }
}

export interface ConfirmPlugin {
  install: (app: App) => void
  api: ConfirmApi
}

export function createConfirmPlugin(): ConfirmPlugin {
  const state = ref<ConfirmationDialogState>(defaultState())

  function openDialog(options: ConfirmationOptions, notify: boolean): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      state.value = {
        open: true,
        title: options.title || (notify ? 'Notice' : 'Please confirm'),
        message: options.message,
        confirmLabel: options.confirmLabel || (notify ? 'OK' : 'Confirm'),
        cancelLabel: options.cancelLabel || (notify ? 'Close' : 'Cancel'),
        tone: options.tone || (notify ? 'primary' : 'warning'),
        hideCancel: notify ? true : (options.hideCancel ?? false),
        resolver: resolve,
      }
    })
  }

  function close(confirmed: boolean): void {
    state.value.resolver?.(confirmed)
    state.value = defaultState()
  }

  const api: ConfirmApi = {
    confirm: (options) => openDialog(options, false),
    notify: (options) => openDialog(options, true),
    state,
    close,
  }

  return {
    install(app: App) {
      app.provide(ConfirmKey, api)
    },
    api,
  }
}
