import React, { useEffect } from 'react';
import { Info, CheckCircle2, AlertTriangle, AlertCircle, X } from 'lucide-react';

export type ConfirmationTone = 'primary' | 'success' | 'warning' | 'danger';

interface ConfirmationDialogProps {
  open: boolean;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: ConfirmationTone;
  hideCancel?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const toneConfig: Record<ConfirmationTone, {
  accent: string;
  soft: string;
  border: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  buttonGradient: string;
}> = {
  primary: {
    accent: 'bg-om-green/5',
    soft: 'bg-om-green/5',
    border: 'border-om-green/20',
    icon: Info,
    iconColor: 'text-om-green',
    buttonGradient: 'linear-gradient(135deg, #009979 0%, #3F9339 100%)',
  },
  success: {
    accent: 'bg-om-green/5',
    soft: 'bg-om-green/5',
    border: 'border-om-green/20',
    icon: CheckCircle2,
    iconColor: 'text-om-green',
    buttonGradient: 'linear-gradient(135deg, #009979 0%, #3F9339 100%)',
  },
  warning: {
    accent: 'bg-amber-50',
    soft: 'bg-amber-50',
    border: 'border-amber-200',
    icon: AlertTriangle,
    iconColor: 'text-om-warning',
    buttonGradient: 'linear-gradient(135deg, #b73514 0%, #d94a1e 100%)',
  },
  danger: {
    accent: 'bg-om-error/5',
    soft: 'bg-om-error/5',
    border: 'border-om-error/20',
    icon: AlertCircle,
    iconColor: 'text-om-error',
    buttonGradient: 'linear-gradient(135deg, #ca0027 0%, #e0002f 100%)',
  },
};

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  open,
  title = 'Please confirm',
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'warning',
  hideCancel = false,
  onConfirm,
  onCancel
}) => {
  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCancel();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onCancel]);

  if (!open) {
    return null;
  }

  const currentTone = toneConfig[tone] || toneConfig.warning;
  const IconComponent = currentTone.icon;

  return (
    <div
      className="fixed inset-0 z-[2500] flex items-center justify-center p-4"
      style={{
        backgroundColor: 'rgba(15, 23, 42, 0.58)',
        backdropFilter: 'blur(4px)',
      }}
      onClick={onCancel}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="global-confirmation-dialog-title"
        onClick={(event) => event.stopPropagation()}
        className={`w-full max-w-md overflow-hidden rounded-xl bg-white shadow-2xl border ${currentTone.border}`}
      >
        {/* Header */}
        <div className={`flex items-center gap-3 border-b ${currentTone.border} ${currentTone.soft} px-6 py-4`}>
          <div className={`flex h-10 w-10 items-center justify-center rounded-full ${currentTone.accent}`}>
            <IconComponent className={`h-6 w-6 ${currentTone.iconColor}`} />
          </div>
          <h3
            id="global-confirmation-dialog-title"
            className="m-0 flex-1 text-lg font-semibold text-gray-900"
          >
            {title}
          </h3>
          <button
            onClick={onCancel}
            className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-5">
          <p className="m-0 text-sm leading-relaxed text-gray-600 whitespace-pre-line">
            {message}
          </p>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t border-gray-100 px-6 py-4">
          {!hideCancel && (
            <button
              onClick={onCancel}
              className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
            >
              {cancelLabel}
            </button>
          )}
          <button
            onClick={onConfirm}
            className="rounded-lg px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg"
            style={{
              background: currentTone.buttonGradient,
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationDialog;
