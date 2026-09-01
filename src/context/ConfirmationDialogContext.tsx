import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import ConfirmationDialog, { ConfirmationTone } from '../components/ConfirmationDialog';

interface ConfirmationOptions {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: ConfirmationTone;
  hideCancel?: boolean;
}

interface ConfirmationDialogState {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  tone: ConfirmationTone;
  hideCancel: boolean;
  resolver: ((confirmed: boolean) => void) | null;
}

interface ConfirmationDialogContextValue {
  confirm: (options: ConfirmationOptions) => Promise<boolean>;
  notify: (options: ConfirmationOptions) => Promise<boolean>;
}

const defaultDialogState: ConfirmationDialogState = {
  open: false,
  title: 'Please confirm',
  message: '',
  confirmLabel: 'Confirm',
  cancelLabel: 'Cancel',
  tone: 'warning',
  hideCancel: false,
  resolver: null
};

const ConfirmationDialogContext = createContext<ConfirmationDialogContextValue | undefined>(undefined);

export const ConfirmationDialogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dialogState, setDialogState] = useState<ConfirmationDialogState>(defaultDialogState);

  const confirm = useCallback((options: ConfirmationOptions) => {
    return new Promise<boolean>((resolve) => {
      setDialogState({
        open: true,
        title: options.title || 'Please confirm',
        message: options.message,
        confirmLabel: options.confirmLabel || 'Confirm',
        cancelLabel: options.cancelLabel || 'Cancel',
        tone: options.tone || 'warning',
        hideCancel: options.hideCancel || false,
        resolver: resolve
      });
    });
  }, []);

  const notify = useCallback((options: ConfirmationOptions) => {
    return new Promise<boolean>((resolve) => {
      setDialogState({
        open: true,
        title: options.title || 'Notice',
        message: options.message,
        confirmLabel: options.confirmLabel || 'OK',
        cancelLabel: options.cancelLabel || 'Close',
        tone: options.tone || 'primary',
        hideCancel: true,
        resolver: resolve
      });
    });
  }, []);

  const closeDialog = useCallback((confirmed: boolean) => {
    if (dialogState.resolver) {
      dialogState.resolver(confirmed);
    }
    setDialogState(defaultDialogState);
  }, [dialogState]);

  const contextValue = useMemo(() => ({ confirm, notify }), [confirm, notify]);

  return (
    <ConfirmationDialogContext.Provider value={contextValue}>
      {children}
      <ConfirmationDialog
        open={dialogState.open}
        title={dialogState.title}
        message={dialogState.message}
        confirmLabel={dialogState.confirmLabel}
        cancelLabel={dialogState.cancelLabel}
        tone={dialogState.tone}
        hideCancel={dialogState.hideCancel}
        onConfirm={() => closeDialog(true)}
        onCancel={() => closeDialog(false)}
      />
    </ConfirmationDialogContext.Provider>
  );
};

export const useConfirmationDialog = () => {
  const context = useContext(ConfirmationDialogContext);

  if (!context) {
    throw new Error('useConfirmationDialog must be used within a ConfirmationDialogProvider');
  }

  return context;
};
