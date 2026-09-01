import React from 'react';
import { FloatingInput } from '../ui/floating-input';
import { FloatingSelect } from '../ui/floating-select';
import { SelectItem } from '../ui/select';
import { FloatingTextarea } from '../ui/floating-textarea';
import { RadioGroup, RadioItem } from '../ui/radio';
import { FileUploadArea } from '../ui/FileUploadArea';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Plus, X } from 'lucide-react';
import { ErrorIcon } from '../kyc-group/ErrorIcon';
import { StepProps, PROOF_OF_ADDRESS_OPTIONS, MARITAL_STATUS_OPTIONS, requiredLabel } from './types';

interface StepPersonalInfoProps extends StepProps {
  addPolicyNumber: () => void;
  updatePolicyNumber: (index: number, value: string) => void;
  removePolicyNumber: (index: number) => void;
}

export const StepPersonalInfo: React.FC<StepPersonalInfoProps> = ({
  formData,
  errors,
  fileSelections,
  fileInputRefs,
  handleInputChange,
  handleFileChange,
  addPolicyNumber,
  updatePolicyNumber,
  removePolicyNumber,
}) => {
  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div>
          <FloatingInput
            id="firstName"
            label={requiredLabel('First Name', 'firstName')}
            value={formData.firstName}
            onChange={(e) => handleInputChange('firstName', e.target.value)}
            error={!!errors.firstName}
            maxLength={100}
          />
          {errors.firstName && (
            <div className="flex items-center gap-1.5 mt-1">
              <ErrorIcon />
              <p className="text-xs text-om-error font-medium">{errors.firstName}</p>
            </div>
          )}
        </div>
        <div>
          <FloatingInput
            id="lastName"
            label={requiredLabel('Last Name', 'lastName')}
            value={formData.lastName}
            onChange={(e) => handleInputChange('lastName', e.target.value)}
            error={!!errors.lastName}
            maxLength={100}
          />
          {errors.lastName && (
            <div className="flex items-center gap-1.5 mt-1">
              <ErrorIcon />
              <p className="text-xs text-om-error font-medium">{errors.lastName}</p>
            </div>
          )}
        </div>
        <div>
          <FloatingInput
            id="middleName"
            label="Middle Name (optional)"
            value={formData.middleName}
            onChange={(e) => handleInputChange('middleName', e.target.value)}
            maxLength={100}
          />
        </div>
      </div>

      <div className="border-t border-gray-200 mb-8" />

      <div className="mb-8">
        <h3 className="text-base font-bold text-black mb-1">
          {requiredLabel('Policy Numbers/Investment Numbers/Policy Numbers', 'policyNumbers')}
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Add each policy, investment, or policy number individually
        </p>

        {formData.policyNumbers.map((policy, index) => (
          <div
            key={index}
            className="flex items-center gap-3 mb-3 p-3 border border-gray-200 rounded-lg bg-gray-50"
          >
            <span className="font-bold text-gray-500 mr-1">
              #{index + 1}
            </span>
            <div className="flex-1">
              <FloatingInput
                id={`policy-${index}`}
                label="Policy/Investment number"
                value={policy}
                onChange={(e) => updatePolicyNumber(index, e.target.value)}
                maxLength={50}
              />
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => removePolicyNumber(index)}
              className="px-3 shrink-0"
            >
              <X className="h-4 w-4 mr-1" />
              Remove
            </Button>
          </div>
        ))}

        <Button
          onClick={addPolicyNumber}
          className="w-full sm:w-auto bg-gradient-to-r from-om-gradient-start to-om-gradient-end hover:from-om-gradient-hover-start hover:to-om-gradient-hover-end"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Policy Number
        </Button>

        {formData.policyNumbers.length > 0 && (
          <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-gray-700">
              <strong>Summary:</strong> {formData.policyNumbers.filter((p) => p.trim()).length} policy number(s) added
              {formData.policyNumbers.filter((p) => !p.trim()).length > 0 && (
                <span className="text-amber-700 ml-2">
                  ({formData.policyNumbers.filter((p) => !p.trim()).length} empty)
                </span>
              )}
            </p>
          </div>
        )}

        {errors.policyNumbers && (
          <div className="flex items-center gap-1.5 mt-2">
            <ErrorIcon />
            <p className="text-sm text-om-error font-medium">{errors.policyNumbers}</p>
          </div>
        )}
      </div>

      <div className="border-t border-gray-200 mb-8" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div>
          <Label className="text-sm font-bold text-black mb-3 block">{requiredLabel('Gender', 'gender')}</Label>
          <RadioGroup
            value={formData.gender}
            onValueChange={(value) => handleInputChange('gender', value)}
            className="flex flex-col gap-3"
          >
            <div className="flex items-center gap-3">
              <RadioItem id="gender-male" value="Male" />
              <Label htmlFor="gender-male" className="cursor-pointer text-sm">
                Male
              </Label>
            </div>
            <div className="flex items-center gap-3">
              <RadioItem id="gender-female" value="Female" />
              <Label htmlFor="gender-female" className="cursor-pointer text-sm">
                Female
              </Label>
            </div>
          </RadioGroup>
          {errors.gender && (
            <div className="flex items-center gap-1.5 mt-2">
              <ErrorIcon className="h-4 w-4 shrink-0" />
              <p className="text-sm text-om-error font-medium">{errors.gender}</p>
            </div>
          )}
        </div>

        <div>
          <FloatingSelect
            label={requiredLabel('Marital Status', 'maritalStatus')}
            value={formData.maritalStatus}
            onValueChange={(value) => handleInputChange('maritalStatus', value)}
            error={!!errors.maritalStatus}
          >
            <SelectItem value="">
              <em>Select status</em>
            </SelectItem>
            {MARITAL_STATUS_OPTIONS.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </FloatingSelect>
          {errors.maritalStatus && (
            <div className="flex items-center gap-1.5 mt-1">
              <ErrorIcon />
              <p className="text-xs text-om-error font-medium">{errors.maritalStatus}</p>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-gray-200 mb-8" />

      <div className="mb-8">
        <FloatingTextarea
          id="physicalAddress"
          label={requiredLabel('Physical Address (brief description)', 'physicalAddress')}
          value={formData.physicalAddress}
          onChange={(e) => handleInputChange('physicalAddress', e.target.value)}
          rows={3}
          error={!!errors.physicalAddress}
          maxLength={500}
        />
        {errors.physicalAddress && (
          <div className="flex items-center gap-1.5 mt-1">
            <ErrorIcon />
            <p className="text-xs text-om-error font-medium">{errors.physicalAddress}</p>
          </div>
        )}
      </div>

      <div className="mb-8">
        <FloatingTextarea
          id="postalAddress"
          label={requiredLabel('Postal Address', 'postalAddress')}
          value={formData.postalAddress}
          onChange={(e) => handleInputChange('postalAddress', e.target.value)}
          rows={3}
          error={!!errors.postalAddress}
          maxLength={500}
        />
        {errors.postalAddress && (
          <div className="flex items-center gap-1.5 mt-1">
            <ErrorIcon />
            <p className="text-xs text-om-error font-medium">{errors.postalAddress}</p>
          </div>
        )}
      </div>

      <div className="border-t border-gray-200 mb-8" />

      <div className="mb-4">
        <Label className="text-sm font-bold text-black mb-4 block">
          {requiredLabel('Proof of Address (select which has been attached)', 'proofOfAddress')}
        </Label>
        <RadioGroup
          value={formData.proofOfAddress}
          onValueChange={(value) => handleInputChange('proofOfAddress', value)}
          className="grid grid-cols-1 sm:grid-cols-2 gap-3"
        >
          {PROOF_OF_ADDRESS_OPTIONS.map((option) => (
            <div key={option} className="flex items-center gap-3">
              <RadioItem id={`proof-${option.replace(/\s+/g, '-')}`} value={option} />
              <Label
                htmlFor={`proof-${option.replace(/\s+/g, '-')}`}
                className="cursor-pointer text-sm"
              >
                {option}
              </Label>
            </div>
          ))}
        </RadioGroup>
        {errors.proofOfAddress && (
          <div className="flex items-center gap-1.5 mt-2">
            <ErrorIcon className="h-4 w-4 shrink-0" />
            <p className="text-sm text-om-error font-medium">{errors.proofOfAddress}</p>
          </div>
        )}
      </div>

      <FileUploadArea
        label="proof of address document file"
        field="documents.proofOfAddress"
        error={errors.proofOfAddressFile}
        fileSelections={fileSelections}
        fileInputRefs={fileInputRefs}
        handleFileChange={handleFileChange}
      />
    </div>
  );
};
