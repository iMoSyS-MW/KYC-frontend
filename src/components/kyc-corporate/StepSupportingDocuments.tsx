import React from 'react';
import { FloatingSelect } from '../ui/floating-select';
import { SelectItem } from '../ui/select';
import { FileUploadArea } from '../ui/FileUploadArea';
import { ErrorIcon } from '../kyc-group/ErrorIcon';
import { StepProps, ARTICLES_OPTIONS, DIRECTORS_ID_OPTIONS, SOURCE_OF_FUNDS_OPTIONS, BANK_ACCOUNT_OPTIONS, requiredLabel } from './types';

export const StepSupportingDocuments: React.FC<StepProps> = ({
  formData,
  errors,
  fileSelections,
  fileInputRefs,
  handleInputChange,
  handleFileChange,
}) => {
  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-bold text-black mb-4">
          {requiredLabel('Articles of Association/Constitution', 'articlesOfAssociation')}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <FloatingSelect
              label="Document Type"
              value={formData.articlesOfAssociation}
              onValueChange={(value: string) => handleInputChange('articlesOfAssociation', value)}
              error={!!errors.articlesOfAssociation}
            >
              {ARTICLES_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </FloatingSelect>
            {errors.articlesOfAssociation && (
              <div className="flex items-center gap-1.5 mt-1">
                <ErrorIcon className="h-4 w-4 shrink-0" />
                <p className="text-xs text-om-error font-medium">{errors.articlesOfAssociation}</p>
              </div>
            )}
          </div>
          <FileUploadArea
            label="articles of association file"
            field="documents.articles"
            error={errors.articlesFile}
            fileSelections={fileSelections}
            fileInputRefs={fileInputRefs}
            handleFileChange={handleFileChange}
          />
        </div>
      </div>

      <div className="border-t border-gray-200 mb-8" />

      <div className="mb-8">
        <p className="text-sm font-bold text-black mb-4">
          {requiredLabel('Directors/Senior Management ID', 'directorsId')}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <FloatingSelect
              label="Document Type"
              value={formData.directorsId}
              onValueChange={(value: string) => handleInputChange('directorsId', value)}
              error={!!errors.directorsId}
            >
              {DIRECTORS_ID_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </FloatingSelect>
            {errors.directorsId && (
              <div className="flex items-center gap-1.5 mt-1">
                <ErrorIcon className="h-4 w-4 shrink-0" />
                <p className="text-xs text-om-error font-medium">{errors.directorsId}</p>
              </div>
            )}
          </div>
          <FileUploadArea
            label="directors ID document file"
            field="documents.directorsId"
            error={errors.directorsIdFile}
            fileSelections={fileSelections}
            fileInputRefs={fileInputRefs}
            handleFileChange={handleFileChange}
            multiple={true}
          />
        </div>
      </div>

      <div className="border-t border-gray-200 mb-8" />

      <div className="mb-8">
        <p className="text-sm font-bold text-black mb-4">
          {requiredLabel('Source of Funds', 'sourceOfFunds')}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <FloatingSelect
              label="Document Type"
              value={formData.sourceOfFunds}
              onValueChange={(value: string) => handleInputChange('sourceOfFunds', value)}
              error={!!errors.sourceOfFunds}
            >
              {SOURCE_OF_FUNDS_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </FloatingSelect>
            {errors.sourceOfFunds && (
              <div className="flex items-center gap-1.5 mt-1">
                <ErrorIcon className="h-4 w-4 shrink-0" />
                <p className="text-xs text-om-error font-medium">{errors.sourceOfFunds}</p>
              </div>
            )}
          </div>
          <FileUploadArea
            label="source of funds document file"
            field="documents.sourceOfFunds"
            error={errors.sourceOfFundsFile}
            fileSelections={fileSelections}
            fileInputRefs={fileInputRefs}
            handleFileChange={handleFileChange}
            multiple={true}
          />
        </div>
      </div>

      <div className="border-t border-gray-200 mb-8" />

      <div className="mb-4">
        <p className="text-sm font-bold text-black mb-4">
          {requiredLabel('Bank Account Proof', 'bankAccountProof')}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <FloatingSelect
              label="Document Type"
              value={formData.bankAccountProof}
              onValueChange={(value: string) => handleInputChange('bankAccountProof', value)}
              error={!!errors.bankAccountProof}
            >
              {BANK_ACCOUNT_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </FloatingSelect>
            {errors.bankAccountProof && (
              <div className="flex items-center gap-1.5 mt-1">
                <ErrorIcon className="h-4 w-4 shrink-0" />
                <p className="text-xs text-om-error font-medium">{errors.bankAccountProof}</p>
              </div>
            )}
          </div>
          <FileUploadArea
            label="bank account proof document file"
            field="documents.bankAccount"
            error={errors.bankAccountFile}
            fileSelections={fileSelections}
            fileInputRefs={fileInputRefs}
            handleFileChange={handleFileChange}
            multiple={true}
          />
        </div>
      </div>
    </div>
  );
};
