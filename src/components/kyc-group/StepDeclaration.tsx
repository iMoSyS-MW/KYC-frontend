import React from 'react';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { ErrorIcon } from './ErrorIcon';
import { StepProps, requiredLabel } from './types';

export const StepDeclaration: React.FC<StepProps> = ({
  formData,
  errors,
  handleInputChange,
}) => {
  return (
    <div>
      <div className="space-y-4 mb-6">
        <p className="text-sm text-gray-800 leading-relaxed">
          We have read and can confirm that the information provided above is true and correct.
        </p>
        <p className="text-sm text-gray-800 leading-relaxed">
          We understand that any misrepresentation of facts affects lines of communication of our business with Old Mutual.
        </p>
        <p className="text-sm text-gray-800 leading-relaxed">
          We undertake to keep Old Mutual informed of any changes to be made in the future to the information provided.
        </p>
        <p className="text-sm text-gray-800 leading-relaxed">
          We further consent to Old Mutual sharing our Group's information within Old Mutual's different business units in Malawi for internal business-related purposes only.
        </p>
        <p className="text-xs text-gray-400 leading-relaxed mt-6">
          (Please note that as our client, all your personal information is treated with strict confidentiality by all Old Mutual employees and Old Mutual is legally bound to protecting our clients information)
        </p>
      </div>

      <div className="flex items-start gap-3 mt-8">
        <Checkbox
          id="declaration"
          checked={formData.declaration}
          onCheckedChange={(checked) => handleInputChange('declaration', checked)}
          className="mt-0.5"
        />
        <Label htmlFor="declaration" className="text-sm text-gray-800 cursor-pointer leading-snug">
          {requiredLabel('I agree to the declaration and consent to the terms above.', 'declaration')}
        </Label>
      </div>

      {errors.declaration && (
        <div className="flex items-center gap-1.5 mt-2">
          <ErrorIcon />
          <p className="text-sm text-om-error font-medium">{errors.declaration}</p>
        </div>
      )}
    </div>
  );
};
