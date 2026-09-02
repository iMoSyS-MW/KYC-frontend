import React from 'react';
import { FloatingInput } from '../ui/floating-input';
import { Button } from '../ui/button';
import {
  SelectItem,
} from '../ui/select';
import { FloatingSelect } from '../ui/floating-select';
import { Plus, X } from 'lucide-react';
import { ErrorIcon } from './ErrorIcon';
import { StepProps, Signatory } from './types';

interface StepSignatoriesProps extends StepProps {
  addSignatory: () => void;
  removeSignatory: (index: number) => void;
  updateSignatory: (index: number, field: string, value: any) => void;
  handleSignatoryIdTypeChange: (index: number, idType: string) => void;
}

interface CustomFileInputProps {
  label: string;
  field: string;
  error?: string;
  fileSelections: { [key: string]: File | null };
  fileInputRefs: { [key: string]: React.RefObject<HTMLInputElement | null> };
  handleFileChange: (field: string, files: FileList | null) => void;
}

const CustomFileInput: React.FC<CustomFileInputProps> = ({
  label,
  field,
  error,
  fileSelections,
  fileInputRefs,
  handleFileChange,
}) => {
  const fileKey = field.split('.')[1] || field;
  const selectedFile = fileSelections[fileKey];

  return (
    <div className="mt-3">
      <input
        ref={fileInputRefs[fileKey as keyof typeof fileInputRefs]}
        type="file"
        onChange={(e) => handleFileChange(field, e.target.files)}
        className="hidden"
        accept=".pdf,.doc,.docx,.jpg,.png"
      />

      <div
        onClick={() => fileInputRefs[fileKey as keyof typeof fileInputRefs]?.current?.click()}
        className={`w-full p-3 rounded-lg cursor-pointer flex items-center justify-center transition-all duration-300 ${
          error
            ? 'border-2 border-om-error'
            : selectedFile
            ? 'border-2 border-om-success bg-green-50'
            : 'border-2 border-gray-200 bg-gray-50 hover:bg-gray-100 hover:border-om-green'
        }`}
      >
        <span className={`text-sm ${selectedFile ? 'text-om-success' : 'text-gray-500'}`}>
          {selectedFile ? `✓ ${selectedFile.name}` : ` ${label}`}
        </span>
      </div>

      {selectedFile && (
        <div className="mt-2 p-3 bg-om-tertiary rounded-lg border border-om-success">
          <p className="text-sm text-om-success font-semibold">
            ✓ Selected: {selectedFile.name}
          </p>
          <p className="text-xs text-gray-500">
            Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
          </p>
        </div>
      )}

      {!selectedFile && (
        <p className="text-xs text-gray-400 mt-1 italic">
          Click to select {label.toLowerCase()}
        </p>
      )}

      {error && (
        <div className="flex items-center gap-1.5 mt-1">
          <ErrorIcon />
          <p className="text-sm text-om-error font-medium">{error}</p>
        </div>
      )}
    </div>
  );
};

export const StepSignatories: React.FC<StepSignatoriesProps> = ({
  formData,
  errors,
  fileSelections,
  fileInputRefs,
  addSignatory,
  removeSignatory,
  updateSignatory,
  handleSignatoryIdTypeChange,
  handleFileChange,
}) => {
  return (
    <div>
      <p className="text-base font-semibold text-black mb-6">
        Add the authorised signatories for the group (minimum 1 required)
      </p>

      <Button
        onClick={addSignatory}
        className="w-full bg-gradient-to-r from-om-gradient-start to-om-gradient-end hover:from-om-gradient-hover-start hover:to-om-gradient-hover-end mb-8"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Signatory
      </Button>

      {errors.signatories && (
        <div className="flex items-center gap-1.5 mb-4">
          <ErrorIcon />
          <p className="text-sm text-om-error font-medium">{errors.signatories}</p>
        </div>
      )}

      {formData.signatories.map((signatory: Signatory, index: number) => (
        <div
          key={index}
          className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50"
        >
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-semibold text-black">
              Signatory {index + 1}
            </h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeSignatory(index)}
              className="text-om-error hover:text-om-error hover:bg-red-50"
            >
              <X className="h-4 w-4 mr-1" />
              Remove
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <FloatingInput
                id={`signatory-${index}-fullName`}
                label={<>Full Name <span className="text-om-error">*</span></>}
                value={signatory.fullName}
                onChange={(e) => updateSignatory(index, 'fullName', e.target.value)}
                error={!!errors[`signatory_${index}_fullName`]}
                maxLength={100}
              />
              {errors[`signatory_${index}_fullName`] && (
                <div className="flex items-center gap-1.5 mt-1">
                  <ErrorIcon />
                  <p className="text-xs text-om-error font-medium">{errors[`signatory_${index}_fullName`]}</p>
                </div>
              )}
            </div>
            <div>
              <FloatingInput
                id={`signatory-${index}-phone`}
                label={<>Phone Number <span className="text-om-error">*</span></>}
                value={signatory.phone}
                onChange={(e) => updateSignatory(index, 'phone', e.target.value)}
                error={!!errors[`signatory_${index}_phone`]}
                maxLength={20}
              />
              {errors[`signatory_${index}_phone`] && (
                <div className="flex items-center gap-1.5 mt-1">
                  <ErrorIcon />
                  <p className="text-xs text-om-error font-medium">{errors[`signatory_${index}_phone`]}</p>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <FloatingInput
                id={`signatory-${index}-email`}
                label={<>Email Address <span className="text-om-error">*</span></>}
                value={signatory.email}
                onChange={(e) => updateSignatory(index, 'email', e.target.value)}
                error={!!errors[`signatory_${index}_email`]}
                maxLength={254}
              />
              {errors[`signatory_${index}_email`] && (
                <div className="flex items-center gap-1.5 mt-1">
                  <ErrorIcon />
                  <p className="text-xs text-om-error font-medium">{errors[`signatory_${index}_email`]}</p>
                </div>
              )}
            </div>
            <div>
              <FloatingInput
                id={`signatory-${index}-occupation`}
                label={<>Occupation <span className="text-om-error">*</span></>}
                value={signatory.occupation}
                onChange={(e) => updateSignatory(index, 'occupation', e.target.value)}
                error={!!errors[`signatory_${index}_occupation`]}
                maxLength={100}
              />
              {errors[`signatory_${index}_occupation`] && (
                <div className="flex items-center gap-1.5 mt-1">
                  <ErrorIcon />
                  <p className="text-xs text-om-error font-medium">{errors[`signatory_${index}_occupation`]}</p>
                </div>
              )}
            </div>
          </div>

          <div className="mb-4">
              <FloatingInput
                id={`signatory-${index}-address`}
                label={<>Address <span className="text-om-error">*</span></>}
                value={signatory.address}
                onChange={(e) => updateSignatory(index, 'address', e.target.value)}
                error={!!errors[`signatory_${index}_address`]}
                maxLength={500}
              />
            {errors[`signatory_${index}_address`] && (
              <div className="flex items-center gap-1.5 mt-1">
                <ErrorIcon />
                <p className="text-xs text-om-error font-medium">{errors[`signatory_${index}_address`]}</p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <FloatingSelect
                label={<>ID Type <span className="text-om-error">*</span></>}
                value={signatory.idType}
                onValueChange={(value) => handleSignatoryIdTypeChange(index, value)}
                error={!!errors[`signatory_${index}_idType`]}
              >
                <SelectItem value="National ID">National ID</SelectItem>
                <SelectItem value="Passport">Passport</SelectItem>
                <SelectItem value="Driver's License">Driver's License</SelectItem>
              </FloatingSelect>
              {errors[`signatory_${index}_idType`] && (
                <div className="flex items-center gap-1.5 mt-1">
                  <ErrorIcon />
                  <p className="text-xs text-om-error font-medium">{errors[`signatory_${index}_idType`]}</p>
                </div>
              )}
            </div>
            <div>
              <FloatingSelect
                label={<>Address Proof Type <span className="text-om-error">*</span></>}
                value={signatory.addressProof}
                onValueChange={(value) => updateSignatory(index, 'addressProof', value)}
                error={!!errors[`signatory_${index}_addressProof`]}
              >
                <SelectItem value="Utility Bill">Utility Bill</SelectItem>
                <SelectItem value="Bank Statement">Bank Statement</SelectItem>
                <SelectItem value="Lease Agreement">Lease Agreement</SelectItem>
              </FloatingSelect>
              {errors[`signatory_${index}_addressProof`] && (
                <div className="flex items-center gap-1.5 mt-1">
                  <ErrorIcon />
                  <p className="text-xs text-om-error font-medium">{errors[`signatory_${index}_addressProof`]}</p>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {signatory.idType === 'National ID' ? (
              <>
                <CustomFileInput
                  label="National ID front side"
                  field={`signatory_${index}_idFront`}
                  error={errors[`signatory_${index}_idDocumentFront`]}
                  fileSelections={fileSelections}
                  fileInputRefs={fileInputRefs}
                  handleFileChange={handleFileChange}
                />
                <CustomFileInput
                  label="National ID back side"
                  field={`signatory_${index}_idBack`}
                  error={errors[`signatory_${index}_idDocumentBack`]}
                  fileSelections={fileSelections}
                  fileInputRefs={fileInputRefs}
                  handleFileChange={handleFileChange}
                />
              </>
            ) : (
              <CustomFileInput
                label="ID document"
                field={`signatory_${index}_id`}
                error={errors[`signatory_${index}_idDocument`]}
                fileSelections={fileSelections}
                fileInputRefs={fileInputRefs}
                handleFileChange={handleFileChange}
              />
            )}
            <CustomFileInput
              label="address proof file"
              field={`signatory_${index}_address`}
              error={errors[`signatory_${index}_addressProofFile`]}
              fileSelections={fileSelections}
              fileInputRefs={fileInputRefs}
              handleFileChange={handleFileChange}
            />
          </div>
        </div>
      ))}
    </div>
  );
};
