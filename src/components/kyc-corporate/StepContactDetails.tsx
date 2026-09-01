import React from 'react';
import { FloatingInput } from '../ui/floating-input';
import { FloatingTextarea } from '../ui/floating-textarea';
import { FloatingSelect } from '../ui/floating-select';
import { SelectItem } from '../ui/select';
import { FileUploadArea } from '../ui/FileUploadArea';
import { Label } from '../ui/label';
import { ErrorIcon } from '../kyc-group/ErrorIcon';
import { StepProps, ADDRESS_PROOF_OPTIONS, requiredLabel } from './types';

export const StepContactDetails: React.FC<StepProps> = ({
  formData,
  errors,
  fileSelections,
  fileInputRefs,
  handleInputChange,
  handleFileChange,
}) => {
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div>
          <FloatingInput
            id="phone"
            label={requiredLabel('Office Phone Number', 'phone')}
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            error={!!errors.phone}
            maxLength={20}
          />
          {errors.phone && (
            <div className="flex items-center gap-1.5 mt-1">
              <ErrorIcon className="h-4 w-4 shrink-0" />
              <p className="text-sm text-om-error font-medium">{errors.phone}</p>
            </div>
          )}
        </div>
        <div>
          <FloatingInput
            id="email"
            label="Office Email Address"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            maxLength={254}
          />
        </div>
      </div>

      <div className="mb-8">
        <FloatingTextarea
          id="address"
          label={requiredLabel('Office Address', 'address')}
          value={formData.address}
          onChange={(e) => handleInputChange('address', e.target.value)}
          rows={3}
          error={!!errors.address}
          maxLength={500}
        />
        {errors.address && (
          <div className="flex items-center gap-1.5 mt-1">
            <ErrorIcon className="h-4 w-4 shrink-0" />
            <p className="text-sm text-om-error font-medium">{errors.address}</p>
          </div>
        )}
      </div>

      <div className="border-t border-gray-200 mb-8" />

      <div className="mb-8">
        <Label className="text-sm font-bold text-black mb-4 block">
          {requiredLabel('Contact Person Details', 'contactPersonName')}
        </Label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <FloatingInput
              id="contactPersonName"
              label={requiredLabel('Full Name', 'contactPersonName')}
              value={formData.contactPersonName}
              onChange={(e) => handleInputChange('contactPersonName', e.target.value)}
              error={!!errors.contactPersonName}
              maxLength={100}
            />
            {errors.contactPersonName && (
              <div className="flex items-center gap-1.5 mt-1">
                <ErrorIcon className="h-4 w-4 shrink-0" />
                <p className="text-xs text-om-error font-medium">{errors.contactPersonName}</p>
              </div>
            )}
          </div>
          <div>
            <FloatingInput
              id="contactPersonPhone"
              label={requiredLabel('Phone Number', 'contactPersonPhone')}
              value={formData.contactPersonPhone}
              onChange={(e) => handleInputChange('contactPersonPhone', e.target.value)}
              error={!!errors.contactPersonPhone}
              maxLength={20}
            />
            {errors.contactPersonPhone && (
              <div className="flex items-center gap-1.5 mt-1">
                <ErrorIcon className="h-4 w-4 shrink-0" />
                <p className="text-xs text-om-error font-medium">{errors.contactPersonPhone}</p>
              </div>
            )}
          </div>
          <div>
            <FloatingInput
              id="contactPersonEmail"
              label={requiredLabel('Email Address', 'contactPersonEmail')}
              type="email"
              value={formData.contactPersonEmail}
              onChange={(e) => handleInputChange('contactPersonEmail', e.target.value)}
              error={!!errors.contactPersonEmail}
              maxLength={254}
            />
            {errors.contactPersonEmail && (
              <div className="flex items-center gap-1.5 mt-1">
                <ErrorIcon className="h-4 w-4 shrink-0" />
                <p className="text-xs text-om-error font-medium">{errors.contactPersonEmail}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 mb-8" />

      <div className="mb-4">
        <FloatingSelect
          label={requiredLabel('Proof of Office Address', 'addressProof')}
          value={formData.addressProof}
          onValueChange={(value: string) => handleInputChange('addressProof', value)}
          error={!!errors.addressProof}
        >
          {ADDRESS_PROOF_OPTIONS.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </FloatingSelect>
        {errors.addressProof && (
          <div className="flex items-center gap-1.5 mt-1">
            <ErrorIcon className="h-4 w-4 shrink-0" />
            <p className="text-sm text-om-error font-medium">{errors.addressProof}</p>
          </div>
        )}
      </div>

      <FileUploadArea
        label="address proof document file"
        field="documents.addressProof"
        error={errors.addressProofFile}
        fileSelections={fileSelections}
        fileInputRefs={fileInputRefs}
        handleFileChange={handleFileChange}
      />
    </div>
  );
};
