import React, { useEffect } from 'react';
import { CheckCircle2, X } from 'lucide-react';

interface SuccessModalProps {
  open: boolean;
  title?: string;
  message: string;
  onClose: () => void;
}

const SuccessModal: React.FC<SuccessModalProps> = ({
  open,
  title = 'Submission Successful',
  message,
  onClose,
}) => {
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[2500] flex items-center justify-center p-4"
      style={{
        backgroundColor: 'rgba(15, 23, 42, 0.58)',
        backdropFilter: 'blur(4px)',
      }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="success-modal-title"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md overflow-hidden rounded-xl bg-white shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-om-green/20 bg-om-green/5 px-6 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-om-green/10">
            <CheckCircle2 className="h-6 w-6 text-om-green" />
          </div>
          <h3
            id="success-modal-title"
            className="m-0 text-lg font-semibold text-gray-900"
          >
            {title}
          </h3>
          <button
            onClick={onClose}
            className="ml-auto rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-5">
          <p className="m-0 text-sm leading-relaxed text-gray-600">
            {message}
          </p>
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t border-gray-100 px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-lg px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg"
            style={{
              background: 'linear-gradient(135deg, #009979 0%, #3F9339 100%)',
            }}
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;
