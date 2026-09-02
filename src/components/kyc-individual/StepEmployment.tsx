import React from 'react';
import { FloatingInput } from '../ui/floating-input';
import { FloatingTextarea } from '../ui/floating-textarea';
import { FloatingDate } from '../ui/floating-date';
import { RadioGroup, RadioItem } from '../ui/radio';
import { FileUploadArea } from '../ui/FileUploadArea';
import { Label } from '../ui/label';
import { ErrorIcon } from '../kyc-group/ErrorIcon';
import { StepProps, REQUIRED_FIELDS_CONDITIONAL, requiredLabel } from './types';

const INCOME_SOURCE_OPTIONS = ['Employment', 'Business'];

export const StepEmployment: React.FC<StepProps> = ({
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
        <Label className="text-sm font-bold text-black mb-4 block">
          {requiredLabel('Specify Source of Income', 'sourceOfIncome')}
        </Label>
        <RadioGroup
          value={formData.sourceOfIncome}
          onValueChange={(value: string) => handleInputChange('sourceOfIncome', value)}
          className="flex flex-col gap-3"
        >
          {INCOME_SOURCE_OPTIONS.map((option) => (
            <div key={option} className="flex items-center gap-3">
              <RadioItem id={`income-${option.toLowerCase()}`} value={option} />
              <Label
                htmlFor={`income-${option.toLowerCase()}`}
                className="cursor-pointer text-sm"
              >
                {option}
              </Label>
            </div>
          ))}
        </RadioGroup>
        {errors.sourceOfIncome && (
          <div className="flex items-center gap-1.5 mt-2">
            <ErrorIcon className="h-4 w-4 shrink-0" />
            <p className="text-sm text-om-error font-medium">{errors.sourceOfIncome}</p>
          </div>
        )}
      </div>

      <div className="mb-8">
        <FileUploadArea
          label="source of income document file"
          field="documents.sourceOfIncome"
          error={errors.sourceOfIncomeFile}
          fileSelections={fileSelections}
          fileInputRefs={fileInputRefs}
          handleFileChange={handleFileChange}
        />
        {errors.sourceOfIncomeFile && (
          <div className="flex items-center gap-1.5 mt-1">
            <ErrorIcon />
            <p className="text-xs text-om-error font-medium">{errors.sourceOfIncomeFile}</p>
          </div>
        )}
      </div>

      {formData.sourceOfIncome === 'Employment' && (
        <>
          <div className="border-t border-gray-200 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div>
              <FloatingInput
                id="employerName"
                label={<>{REQUIRED_FIELDS_CONDITIONAL.Employment.employerName.replace(' is required', '')} <span className="text-om-error">*</span></>}
                value={formData.employerName}
                onChange={(e) => handleInputChange('employerName', e.target.value)}
                error={!!errors.employerName}
                maxLength={100}
              />
              {errors.employerName && (
                <div className="flex items-center gap-1.5 mt-1">
                  <ErrorIcon />
                  <p className="text-xs text-om-error font-medium">{errors.employerName}</p>
                </div>
              )}
            </div>
            <div>
              <FloatingDate
                id="employmentStartDate"
                label={<>{REQUIRED_FIELDS_CONDITIONAL.Employment.employmentStartDate.replace(' is required', '')} <span className="text-om-error">*</span></>}
                value={formData.employmentStartDate}
                onChange={(value) => handleInputChange('employmentStartDate', value)}
                error={!!errors.employmentStartDate}
              />
              {errors.employmentStartDate && (
                <div className="flex items-center gap-1.5 mt-1">
                  <ErrorIcon />
                  <p className="text-xs text-om-error font-medium">{errors.employmentStartDate}</p>
                </div>
              )}
            </div>
            <div>
              <FloatingInput
                id="monthlyNetIncome"
                label={<>{REQUIRED_FIELDS_CONDITIONAL.Employment.monthlyNetIncome.replace(' is required', '')} <span className="text-om-error">*</span></>}
                type="number"
                value={formData.monthlyNetIncome}
                onChange={(e) => handleInputChange('monthlyNetIncome', e.target.value)}
                error={!!errors.monthlyNetIncome}
              />
              {errors.monthlyNetIncome && (
                <div className="flex items-center gap-1.5 mt-1">
                  <ErrorIcon />
                  <p className="text-xs text-om-error font-medium">{errors.monthlyNetIncome}</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {formData.sourceOfIncome === 'Business' && (
        <>
          <div className="border-t border-gray-200 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <FloatingInput
                id="businessType"
                label={<>{REQUIRED_FIELDS_CONDITIONAL.Business.businessType.replace(' is required', '')} <span className="text-om-error">*</span></>}
                value={formData.businessType}
                onChange={(e) => handleInputChange('businessType', e.target.value)}
                error={!!errors.businessType}
                maxLength={100}
              />
              {errors.businessType && (
                <div className="flex items-center gap-1.5 mt-1">
                  <ErrorIcon />
                  <p className="text-xs text-om-error font-medium">{errors.businessType}</p>
                </div>
              )}
            </div>
            <div>
              <FloatingInput
                id="businessRegistrationNumber"
                label="Business Registration Number"
                value={formData.businessRegistrationNumber}
                onChange={(e) => handleInputChange('businessRegistrationNumber', e.target.value)}
                maxLength={50}
              />
            </div>
          </div>
          <div className="mb-4">
            <FloatingTextarea
              id="businessAddress"
              label={<>{REQUIRED_FIELDS_CONDITIONAL.Business.businessAddress.replace(' is required', '')} <span className="text-om-error">*</span></>}
              value={formData.businessAddress}
              onChange={(e) => handleInputChange('businessAddress', e.target.value)}
              rows={3}
              error={!!errors.businessAddress}
              maxLength={500}
            />
            {errors.businessAddress && (
              <div className="flex items-center gap-1.5 mt-1">
                <ErrorIcon />
                <p className="text-xs text-om-error font-medium">{errors.businessAddress}</p>
              </div>
            )}
          </div>
          <div className="mb-8">
            <FloatingInput
              id="businessMonthlyIncome"
                label={<>{REQUIRED_FIELDS_CONDITIONAL.Business.businessMonthlyIncome.replace(' is required', '')} <span className="text-om-error">*</span></>}
              type="number"
              value={formData.businessMonthlyIncome}
              onChange={(e) => handleInputChange('businessMonthlyIncome', e.target.value)}
              error={!!errors.businessMonthlyIncome}
            />
            {errors.businessMonthlyIncome && (
              <div className="flex items-center gap-1.5 mt-1">
                <ErrorIcon />
                <p className="text-xs text-om-error font-medium">{errors.businessMonthlyIncome}</p>
              </div>
            )}
          </div>
        </>
      )}

      <div className="border-t border-gray-200 mb-8" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div>
          <FloatingInput
            id="otherIncome"
            label="Other Income (specify)"
            value={formData.otherIncome}
            onChange={(e) => handleInputChange('otherIncome', e.target.value)}
            maxLength={100}
          />
        </div>
        <div>
          <FloatingInput
            id="otherMonthlyIncome"
            label="Monthly Income (MWK)"
            type="number"
            value={formData.otherMonthlyIncome}
            onChange={(e) => handleInputChange('otherMonthlyIncome', e.target.value)}
          />
        </div>
      </div>

      <div>
        <FloatingTextarea
          id="sourceOfFunds"
          label={requiredLabel('Specify Source of Funds', 'sourceOfFunds')}
          value={formData.sourceOfFunds}
          onChange={(e) => handleInputChange('sourceOfFunds', e.target.value)}
          rows={4}
          error={!!errors.sourceOfFunds}
          maxLength={1000}
        />
        {errors.sourceOfFunds && (
          <div className="flex items-center gap-1.5 mt-1">
            <ErrorIcon />
            <p className="text-xs text-om-error font-medium">{errors.sourceOfFunds}</p>
          </div>
        )}
      </div>
    </div>
  );
};
