import React from 'react';
import { X } from 'lucide-react';

interface StepStatus {
  label: string;
  completed: boolean;
  percentage: number;
}

interface FloatingProgressIndicatorProps {
  steps: StepStatus[];
  overallProgress: number;
  onClose?: () => void;
  formType: string;
}

const getProgressColor = (percentage: number) => {
  if (percentage === 100) return '#4caf50';
  if (percentage >= 75) return '#8bc34a';
  if (percentage >= 50) return '#ff9800';
  if (percentage >= 25) return '#ff5722';
  return '#f44336';
};

const FloatingProgressIndicator: React.FC<FloatingProgressIndicatorProps> = ({
  steps,
  overallProgress,
  onClose,
  formType,
}) => {
  const incompleteSteps = steps
    .filter((step) => !step.completed)
    .map((step) => step.label)
    .join(', ');

  return (
    <div
      className="fixed bottom-5 left-1/2 -translate-x-1/2 w-[90%] max-w-[500px] z-[1000] rounded-xl border-2 border-[#4caf50] shadow-[0_4px_20px_rgba(76,175,80,0.3)]"
      style={{
        background: 'linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)',
      }}
    >
      <div className="p-3">
        {/* Progress Bar */}
        <div className="mb-2">
          <div className="h-1.5 rounded-full bg-gray-300 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${overallProgress}%`,
                backgroundColor: getProgressColor(overallProgress),
              }}
            />
          </div>
        </div>

        {/* Status Text */}
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-gray-800">
            {formType} KYC: {Math.round(overallProgress)}% complete
            {incompleteSteps && (
              <span className="text-gray-600 ml-2">
                &bull; Incomplete: {incompleteSteps}
              </span>
            )}
          </p>

          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-800 hover:bg-black/5 rounded-full p-1 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FloatingProgressIndicator;
