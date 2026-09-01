import React from 'react';
import { FloatingInput } from '../ui/floating-input';
import { FloatingSelect } from '../ui/floating-select';
import { SelectItem } from '../ui/select';
import { FloatingDate } from '../ui/floating-date';
import { RadioGroup, RadioItem } from '../ui/radio';
import { FileUploadArea } from '../ui/FileUploadArea';
import { Label } from '../ui/label';
import { ErrorIcon } from '../kyc-group/ErrorIcon';
import { StepProps, COUNTRIES, NATIONALITIES, requiredLabel } from './types';

interface StepIdentificationProps extends StepProps {
  handleIdTypeChange: (idType: string) => void;
}

const ID_TYPE_OPTIONS = ['National ID', 'Passport', "Driver's Licence"];

export const StepIdentification: React.FC<StepIdentificationProps> = ({
  formData,
  errors,
  fileSelections,
  fileInputRefs,
  handleInputChange,
  handleFileChange,
  handleIdTypeChange,
}) => {
  return (
    <div>
      <div className="mb-8">
        <Label className="text-sm font-bold text-black mb-4 block">
          {requiredLabel('Type of Identification (select and attach)', 'idType')}
        </Label>
        <RadioGroup
          value={formData.idType}
          onValueChange={handleIdTypeChange}
          className="flex flex-col gap-3"
        >
          {ID_TYPE_OPTIONS.map((option) => (
            <div key={option} className="flex items-center gap-3">
              <RadioItem id={`id-type-${option.replace(/[\s']+/g, '-')}`} value={option} />
              <Label
                htmlFor={`id-type-${option.replace(/[\s']+/g, '-')}`}
                className="cursor-pointer text-sm"
              >
                {option}
              </Label>
            </div>
          ))}
        </RadioGroup>
        {errors.idType && (
          <div className="flex items-center gap-1.5 mt-2">
            <ErrorIcon className="h-4 w-4 shrink-0" />
            <p className="text-sm text-om-error font-medium">{errors.idType}</p>
          </div>
        )}
      </div>

      <div className="mb-8">
        {formData.idType === 'National ID' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <FileUploadArea
                label="national ID front side file"
                field="documents.identificationFront"
                error={errors.identificationFrontFile}
                fileSelections={fileSelections}
                fileInputRefs={fileInputRefs}
                handleFileChange={handleFileChange}
              />
              {errors.identificationFrontFile && (
                <div className="flex items-center gap-1.5 mt-1">
                  <ErrorIcon />
                  <p className="text-xs text-om-error font-medium">{errors.identificationFrontFile}</p>
                </div>
              )}
            </div>
            <div>
              <FileUploadArea
                label="national ID back side file"
                field="documents.identificationBack"
                error={errors.identificationBackFile}
                fileSelections={fileSelections}
                fileInputRefs={fileInputRefs}
                handleFileChange={handleFileChange}
              />
              {errors.identificationBackFile && (
                <div className="flex items-center gap-1.5 mt-1">
                  <ErrorIcon />
                  <p className="text-xs text-om-error font-medium">{errors.identificationBackFile}</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div>
            <FileUploadArea
              label="identification document file"
              field="documents.identification"
              error={errors.identificationFile}
              fileSelections={fileSelections}
              fileInputRefs={fileInputRefs}
              handleFileChange={handleFileChange}
            />
            {errors.identificationFile && (
              <div className="flex items-center gap-1.5 mt-1">
                <ErrorIcon />
                <p className="text-xs text-om-error font-medium">{errors.identificationFile}</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="border-t border-gray-200 mb-8" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div>
          <FloatingInput
            id="idNumber"
            label={requiredLabel('Identification Number', 'idNumber')}
            value={formData.idNumber}
            onChange={(e) => handleInputChange('idNumber', e.target.value)}
            error={!!errors.idNumber}
          />
          {errors.idNumber && (
            <div className="flex items-center gap-1.5 mt-1">
              <ErrorIcon />
              <p className="text-xs text-om-error font-medium">{errors.idNumber}</p>
            </div>
          )}
        </div>
        <div>
          <FloatingDate
            id="dateOfBirth"
            label={requiredLabel('Date of Birth', 'dateOfBirth')}
            value={formData.dateOfBirth}
            onChange={(value) => handleInputChange('dateOfBirth', value)}
            error={!!errors.dateOfBirth}
          />
          {errors.dateOfBirth && (
            <div className="flex items-center gap-1.5 mt-1">
              <ErrorIcon />
              <p className="text-xs text-om-error font-medium">{errors.dateOfBirth}</p>
            </div>
          )}
        </div>
      </div>

      <div className="mb-8">
        <FloatingDate
          id="idExpiryDate"
          label={requiredLabel('Date of Expiry of ID', 'idExpiryDate')}
          value={formData.idExpiryDate}
          onChange={(value) => handleInputChange('idExpiryDate', value)}
          error={!!errors.idExpiryDate}
        />
        {errors.idExpiryDate && (
          <div className="flex items-center gap-1.5 mt-1">
            <ErrorIcon />
            <p className="text-xs text-om-error font-medium">{errors.idExpiryDate}</p>
          </div>
        )}
      </div>

      <div className="border-t border-gray-200 mb-8" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <FloatingSelect
            label={requiredLabel('Country of Residence', 'countryOfResidence')}
            value={formData.countryOfResidence}
            onValueChange={(value: string) => handleInputChange('countryOfResidence', value)}
            error={!!errors.countryOfResidence}
          >
            {COUNTRIES.map((country) => (
              <SelectItem key={country} value={country}>
                {country}
              </SelectItem>
            ))}
          </FloatingSelect>
          {errors.countryOfResidence && (
            <div className="flex items-center gap-1.5 mt-1">
              <ErrorIcon />
              <p className="text-xs text-om-error font-medium">{errors.countryOfResidence}</p>
            </div>
          )}
        </div>
        <div>
          <FloatingSelect
            label={requiredLabel('Nationality', 'nationality')}
            value={formData.nationality}
            onValueChange={(value: string) => handleInputChange('nationality', value)}
            error={!!errors.nationality}
          >
            {NATIONALITIES.map((nationality) => (
              <SelectItem key={nationality} value={nationality}>
                {nationality}
              </SelectItem>
            ))}
          </FloatingSelect>
          {errors.nationality && (
            <div className="flex items-center gap-1.5 mt-1">
              <ErrorIcon />
              <p className="text-xs text-om-error font-medium">{errors.nationality}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
