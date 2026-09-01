import React from 'react';
import { AlertCircle, X } from 'lucide-react';

interface ValidationErrorBannerProps {
  message: string;
  stepName?: string;
  onGoToStep?: () => void;
  onDismiss: () => void;
}

const ValidationErrorBanner: React.FC<ValidationErrorBannerProps> = ({
  message,
  stepName,
  onGoToStep,
  onDismiss,
}) => {
  return (
    <div className="mb-4 rounded-xl border border-om-error/30 bg-om-error/5 p-4">
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 shrink-0 text-om-error mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-om-error">{message}</p>
          {stepName && onGoToStep && (
            <button
              type="button"
              onClick={onGoToStep}
              className="mt-1 text-sm font-semibold text-om-error underline underline-offset-2 hover:text-om-error/80 transition-colors"
            >
              Go to {stepName}
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 rounded-lg p-1 text-om-error/60 hover:text-om-error hover:bg-om-error/10 transition-colors"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default ValidationErrorBanner;
