import React from 'react';
import { Button } from '../ui/button';
import ValidationErrorBanner from '../ui/ValidationErrorBanner';

interface FormPageLayoutProps {
  title: string;
  activeStep: number;
  totalSteps: number;
  stepLabels: string[];
  onPrevious: () => void;
  onNext: () => void;
  onSubmit?: () => void;
  isLastStep: boolean;
  isSubmitting: boolean;
  children: React.ReactNode;
  validationError?: string;
  validationErrorStep?: number;
  validationErrorStepLabel?: string;
  onGoToStep?: (step: number) => void;
  onDismissError?: () => void;
}

const FormPageLayout: React.FC<FormPageLayoutProps> = ({
  title,
  activeStep,
  totalSteps,
  stepLabels,
  onPrevious,
  onNext,
  onSubmit,
  isLastStep,
  isSubmitting,
  children,
  validationError,
  validationErrorStep,
  validationErrorStepLabel,
  onGoToStep,
  onDismissError,
}) => {
  return (
    <div className="min-h-screen pb-24" style={{ backgroundImage: 'url(/background.png)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'repeat' }}>
      <div className="bg-white">
        <div className="max-w-[900px] mx-auto px-4 pt-10 pb-6">
          {/* Stepper */}
          <div className="mb-3">
            <div className="flex gap-1 mb-3">
              {Array.from({ length: totalSteps }).map((_, index) => (
                <div
                  key={index}
                  className={`flex-1 h-1 rounded-full transition-colors duration-300 ${
                    index <= activeStep ? 'bg-om-green' : 'bg-om-tertiary'
                  }`}
                />
              ))}
            </div>
            <p className="text-xs lg:text-sm text-gray-500 font-medium">
              Step {activeStep + 1} of {totalSteps}
            </p>
          </div>

          <h2 className="text-xl sm:text-3xl font-bold text-black mb-0 font-montserrat">
            {title}
          </h2>
        </div>
      </div>

      <div className="max-w-[900px] mx-auto px-4 pt-8">
        {validationError && (
          <ValidationErrorBanner
            message={validationError}
            stepName={validationErrorStepLabel}
            onGoToStep={
              validationErrorStep !== undefined && onGoToStep
                ? () => onGoToStep(validationErrorStep)
                : undefined
            }
            onDismiss={onDismissError || (() => {})}
          />
        )}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_4px_rgba(0,0,0,0.04)] p-6 md:p-10">
          {children}

          <div className="flex justify-end gap-3 mt-10 pt-6 border-t border-gray-100">
            <Button
              variant="outline"
              onClick={onPrevious}
              disabled={activeStep === 0}
              className="px-6"
            >
              Previous
            </Button>
            {isLastStep ? (
              <Button
                onClick={onSubmit}
                disabled={isSubmitting}
                className="px-8 bg-gradient-to-r from-om-gradient-start to-om-gradient-end hover:from-om-gradient-hover-start hover:to-om-gradient-hover-end"
              >
                {isSubmitting ? 'Submitting...' : 'Submit KYC'}
              </Button>
            ) : (
              <Button
                onClick={onNext}
                className="px-8 bg-gradient-to-r from-om-gradient-start to-om-gradient-end hover:from-om-gradient-hover-start hover:to-om-gradient-hover-end"
              >
                Next
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormPageLayout;
