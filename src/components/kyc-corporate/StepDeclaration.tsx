import React from 'react';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { ErrorIcon } from '../kyc-group/ErrorIcon';
import { StepProps, requiredLabel } from './types';

export const StepDeclaration: React.FC<StepProps> = ({
  formData,
  errors,
  handleInputChange,
}) => {
  return (
    <div>
      <div className="space-y-4 mb-8">
        <p className="text-sm text-gray-800 leading-relaxed">
          We have read and can confirm that the information provided above is true and correct. We understand that any misrepresentation of facts affects lines of communication of our business with Old Mutual. We undertake to keep Old Mutual informed of any changes to be made in the future to the information provided.
        </p>
        <p className="text-sm text-gray-800 leading-relaxed">
          We further consent to Old Mutual sharing our Organization's information within Old Mutual's different business units in Malawi for internal business-related purposes only.
        </p>
        <p className="text-xs text-gray-500 leading-relaxed">
          (Please note that as our client, all your personal information is treated with strict confidentiality by all Old Mutual employees and Old Mutual is legally bound to protecting our clients information)
        </p>
      </div>

      <div className="border-t border-gray-200 mb-8" />

      <div className="mb-8">
        <h3 className="text-base font-bold text-black mb-2">
          PEP Declaration
        </h3>
        <p className="text-xs text-gray-500 leading-relaxed mb-6">
          A politically exposed entity is an entity (domestic or foreign) which has been entrusted with a prominent public function such as public institutions, state owned corporations, governing bodies of political parties.
        </p>

        <div className="flex items-start gap-3 mb-6">
          <Checkbox
            id="pepDeclaration"
            checked={formData.pepDeclaration}
            onCheckedChange={(checked) => handleInputChange('pepDeclaration', checked)}
            className="mt-0.5"
          />
          <Label htmlFor="pepDeclaration" className="text-sm text-gray-800 cursor-pointer leading-snug">
            I confirm that this organization is not a Politically Exposed Entity
          </Label>
        </div>
      </div>

      <div className="flex items-start gap-3">
        <Checkbox
          id="declaration"
          checked={formData.declaration}
          onCheckedChange={(checked) => handleInputChange('declaration', checked)}
          className="mt-0.5"
        />
        <Label htmlFor="declaration" className="text-sm text-gray-800 cursor-pointer leading-snug">
          {requiredLabel('I agree to the declaration and consent to the terms above', 'declaration')}
        </Label>
      </div>
      {errors.declaration && (
        <div className="flex items-center gap-1.5 mt-2">
          <ErrorIcon className="h-4 w-4 shrink-0" />
          <p className="text-sm text-om-error font-medium">{errors.declaration}</p>
        </div>
      )}
    </div>
  );
};
