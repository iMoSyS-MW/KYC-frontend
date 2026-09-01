import React from 'react';
import {
  SelectItem,
} from '../ui/select';
import { FloatingSelect } from '../ui/floating-select';
import { ErrorIcon } from './ErrorIcon';
import { StepProps, requiredLabel } from './types';
import { FileUploadArea } from '../ui/FileUploadArea';

export const StepSupportingDocuments: React.FC<StepProps> = ({
  formData,
  errors,
  handleInputChange,
  fileSelections,
  fileInputRefs,
  handleFileChange,
}) => {
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <FloatingSelect
            label={requiredLabel('Founding Document', 'foundingDocument')}
            value={formData.foundingDocument}
            onValueChange={(value) => handleInputChange('foundingDocument', value)}
            error={!!errors.foundingDocument}
          >
            <SelectItem value="Constitution">Constitution</SelectItem>
            <SelectItem value="Minutes">Minutes</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </FloatingSelect>
          {errors.foundingDocument && (
            <div className="flex items-center gap-1.5 mt-1">
              <ErrorIcon />
              <p className="text-sm text-om-error font-medium">{errors.foundingDocument}</p>
            </div>
          )}
        </div>

        <FileUploadArea
          label="founding document file"
          field="documents.founding"
          error={errors.foundingFile}
          fileSelections={fileSelections}
          fileInputRefs={fileInputRefs}
          handleFileChange={handleFileChange}
        />
      </div>

      <div className="border-t border-gray-200 mb-6" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <FloatingSelect
            label={requiredLabel('Source of Funds', 'sourceOfFunds')}
            value={formData.sourceOfFunds}
            onValueChange={(value) => handleInputChange('sourceOfFunds', value)}
            error={!!errors.sourceOfFunds}
          >
            <SelectItem value="Bank Statements">Bank Statements (last 3 months)</SelectItem>
            <SelectItem value="Audited Financials">Latest audited financials</SelectItem>
            <SelectItem value="Tax Returns">Income tax returns</SelectItem>
          </FloatingSelect>
          {errors.sourceOfFunds && (
            <div className="flex items-center gap-1.5 mt-1">
              <ErrorIcon />
              <p className="text-sm text-om-error font-medium">{errors.sourceOfFunds}</p>
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

      <div className="border-t border-gray-200 mb-6" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <FloatingSelect
            label={requiredLabel('Bank Account Proof', 'bankAccountProof')}
            value={formData.bankAccountProof}
            onValueChange={(value) => handleInputChange('bankAccountProof', value)}
            error={!!errors.bankAccountProof}
          >
            <SelectItem value="Bank Confirmation Letter">Bank confirmation letter</SelectItem>
            <SelectItem value="Cancelled Cheque">Cancelled cheque</SelectItem>
            <SelectItem value="Bank Statement">Bank statement (last 3 months)</SelectItem>
          </FloatingSelect>
          {errors.bankAccountProof && (
            <div className="flex items-center gap-1.5 mt-1">
              <ErrorIcon />
              <p className="text-sm text-om-error font-medium">{errors.bankAccountProof}</p>
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
        />
      </div>
    </div>
  );
};
