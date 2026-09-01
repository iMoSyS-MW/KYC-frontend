import React from 'react';
import { RadioGroup, RadioItem } from '../ui/radio';
import { Label } from '../ui/label';
import { ErrorIcon } from '../kyc-group/ErrorIcon';
import { StepProps, requiredLabel } from './types';

export const StepDeclarations: React.FC<StepProps> = ({
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
          We further consent to Old Mutual sharing our information within Old Mutual's different business units in Malawi for internal business-related purposes only.
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
          A politically exposed person is an individual (domestic or foreign) who has been entrusted with a prominent public function such as public institutions, state owned corporations, governing bodies of political parties.
        </p>

        <div className="mb-6">
          <Label className="text-sm font-bold text-black mb-3 block">
            {requiredLabel('I am a politically exposed person (PEP)', 'isPEP')}
          </Label>
          <RadioGroup
            value={formData.isPEP}
            onValueChange={(value: string) => handleInputChange('isPEP', value)}
            className="flex flex-col gap-3"
          >
            <div className="flex items-center gap-3">
              <RadioItem id="pep-yes" value="YES" />
              <Label htmlFor="pep-yes" className="cursor-pointer text-sm">
                YES
              </Label>
            </div>
            <div className="flex items-center gap-3">
              <RadioItem id="pep-no" value="NO" />
              <Label htmlFor="pep-no" className="cursor-pointer text-sm">
                NO
              </Label>
            </div>
          </RadioGroup>
          {errors.isPEP && (
            <div className="flex items-center gap-1.5 mt-2">
              <ErrorIcon className="h-4 w-4 shrink-0" />
              <p className="text-sm text-om-error font-medium">{errors.isPEP}</p>
            </div>
          )}
        </div>

        <div>
          <Label className="text-sm font-bold text-black mb-3 block">
            {requiredLabel('I am related to a politically exposed person (PEP)', 'relatedToPEP')}
          </Label>
          <RadioGroup
            value={formData.relatedToPEP}
            onValueChange={(value: string) => handleInputChange('relatedToPEP', value)}
            className="flex flex-col gap-3"
          >
            <div className="flex items-center gap-3">
              <RadioItem id="related-pep-yes" value="YES" />
              <Label htmlFor="related-pep-yes" className="cursor-pointer text-sm">
                YES
              </Label>
            </div>
            <div className="flex items-center gap-3">
              <RadioItem id="related-pep-no" value="NO" />
              <Label htmlFor="related-pep-no" className="cursor-pointer text-sm">
                NO
              </Label>
            </div>
          </RadioGroup>
          {errors.relatedToPEP && (
            <div className="flex items-center gap-1.5 mt-2">
              <ErrorIcon className="h-4 w-4 shrink-0" />
              <p className="text-sm text-om-error font-medium">{errors.relatedToPEP}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
