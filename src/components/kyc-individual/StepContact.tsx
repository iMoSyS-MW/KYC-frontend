import React from 'react';
import { FloatingInput } from '../ui/floating-input';
import { FloatingSelect } from '../ui/floating-select';
import { SelectItem } from '../ui/select';
import { RadioGroup, RadioItem } from '../ui/radio';
import { Label } from '../ui/label';
import { ErrorIcon } from '../kyc-group/ErrorIcon';
import { StepProps, RELATIONSHIPS, COMMUNICATION_OPTIONS, requiredLabel } from './types';

export const StepContact: React.FC<StepProps> = ({
  formData,
  errors,
  handleInputChange,
}) => {
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div>
          <FloatingInput
            id="nextOfKinName"
            label={requiredLabel('Name of Next of Kin', 'nextOfKinName')}
            value={formData.nextOfKinName}
            onChange={(e) => handleInputChange('nextOfKinName', e.target.value)}
            error={!!errors.nextOfKinName}
            maxLength={100}
          />
          {errors.nextOfKinName && (
            <div className="flex items-center gap-1.5 mt-1">
              <ErrorIcon />
              <p className="text-xs text-om-error font-medium">{errors.nextOfKinName}</p>
            </div>
          )}
        </div>
        <div>
          <FloatingSelect
            label={requiredLabel('Relationship to Customer', 'nextOfKinRelationship')}
            value={formData.nextOfKinRelationship}
            onValueChange={(value: string) => handleInputChange('nextOfKinRelationship', value)}
            error={!!errors.nextOfKinRelationship}
          >
            {RELATIONSHIPS.map((relationship) => (
              <SelectItem key={relationship} value={relationship}>
                {relationship}
              </SelectItem>
            ))}
          </FloatingSelect>
          {errors.nextOfKinRelationship && (
            <div className="flex items-center gap-1.5 mt-1">
              <ErrorIcon />
              <p className="text-xs text-om-error font-medium">{errors.nextOfKinRelationship}</p>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-gray-200 mb-8" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div>
          <FloatingInput
            id="nextOfKinOccupation"
            label={requiredLabel('Occupation', 'nextOfKinOccupation')}
            value={formData.nextOfKinOccupation}
            onChange={(e) => handleInputChange('nextOfKinOccupation', e.target.value)}
            error={!!errors.nextOfKinOccupation}
            maxLength={100}
          />
          {errors.nextOfKinOccupation && (
            <div className="flex items-center gap-1.5 mt-1">
              <ErrorIcon />
              <p className="text-xs text-om-error font-medium">{errors.nextOfKinOccupation}</p>
            </div>
          )}
        </div>
        <div>
          <FloatingInput
            id="cellNumber"
            label={requiredLabel('Mobile Number', 'cellNumber')}
            value={formData.cellNumber}
            onChange={(e) => handleInputChange('cellNumber', e.target.value)}
            error={!!errors.cellNumber}
            maxLength={20}
          />
          {errors.cellNumber && (
            <div className="flex items-center gap-1.5 mt-1">
              <ErrorIcon />
              <p className="text-xs text-om-error font-medium">{errors.cellNumber}</p>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-gray-200 mb-8" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div>
          <FloatingInput
            id="mobileNumber"
            label="Telephone Number"
            value={formData.mobileNumber}
            onChange={(e) => handleInputChange('mobileNumber', e.target.value)}
            maxLength={20}
          />
        </div>
        <div>
          <FloatingInput
            id="emailAddress"
            label={requiredLabel('Email Address', 'emailAddress')}
            type="email"
            value={formData.emailAddress}
            onChange={(e) => handleInputChange('emailAddress', e.target.value)}
            error={!!errors.emailAddress}
            maxLength={254}
          />
          {errors.emailAddress && (
            <div className="flex items-center gap-1.5 mt-1">
              <ErrorIcon />
              <p className="text-xs text-om-error font-medium">{errors.emailAddress}</p>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-gray-200 mb-8" />

      <div>
        <Label className="text-sm font-bold text-black mb-4 block">
          {requiredLabel('Preferred Mode of Communication', 'preferredCommunication')}
        </Label>
        <RadioGroup
          value={formData.preferredCommunication}
          onValueChange={(value: string) => handleInputChange('preferredCommunication', value)}
          className="flex flex-col gap-3"
        >
          {COMMUNICATION_OPTIONS.map((option) => (
            <div key={option} className="flex items-center gap-3">
              <RadioItem id={`comm-${option.replace(/\s+/g, '-').toLowerCase()}`} value={option} />
              <Label
                htmlFor={`comm-${option.replace(/\s+/g, '-').toLowerCase()}`}
                className="cursor-pointer text-sm"
              >
                {option}
              </Label>
            </div>
          ))}
        </RadioGroup>
        {errors.preferredCommunication && (
          <div className="flex items-center gap-1.5 mt-2">
            <ErrorIcon className="h-4 w-4 shrink-0" />
            <p className="text-sm text-om-error font-medium">{errors.preferredCommunication}</p>
          </div>
        )}
      </div>
    </div>
  );
};
