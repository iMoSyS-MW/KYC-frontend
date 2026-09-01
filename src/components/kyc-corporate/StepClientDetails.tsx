import React from 'react';
import { FloatingInput } from '../ui/floating-input';
import { FloatingSelect } from '../ui/floating-select';
import { SelectItem } from '../ui/select';
import { FileUploadArea } from '../ui/FileUploadArea';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Plus, X } from 'lucide-react';
import { ErrorIcon } from '../kyc-group/ErrorIcon';
import { StepProps, PRODUCTS, ID_DOCUMENT_OPTIONS, requiredLabel } from './types';

interface StepClientDetailsProps extends StepProps {
  handleProductChange: (product: string, checked: boolean) => void;
  addSchemeNumber: () => void;
  updateSchemeNumber: (index: number, value: string) => void;
  removeSchemeNumber: (index: number) => void;
}

export const StepClientDetails: React.FC<StepClientDetailsProps> = ({
  formData,
  errors,
  fileSelections,
  fileInputRefs,
  handleInputChange,
  handleFileChange,
  handleProductChange,
  addSchemeNumber,
  updateSchemeNumber,
  removeSchemeNumber,
}) => {
  return (
    <div>
      <div className="mb-8">
        <FloatingInput
          id="organizationName"
          label={requiredLabel('Organisation Name', 'organizationName')}
          value={formData.organizationName}
          onChange={(e) => handleInputChange('organizationName', e.target.value)}
          error={!!errors.organizationName}
          maxLength={200}
        />
        {errors.organizationName && (
          <div className="flex items-center gap-1.5 mt-1">
            <ErrorIcon className="h-4 w-4 shrink-0" />
            <p className="text-sm text-om-error font-medium">{errors.organizationName}</p>
          </div>
        )}
      </div>

      <div className="border-t border-gray-200 mb-8" />

      <div className="mb-8">
        <h3 className="text-base font-bold text-black mb-4">
          {requiredLabel('Products/Schemes', 'products')}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {PRODUCTS.map((product, idx) => {
            const fullLabel = product.label ? `${product.code} ${product.label}` : product.code;
            return (
              <div key={idx} className="flex items-start gap-3">
                <Checkbox
                  id={`product-${idx}`}
                  checked={formData.products.includes(fullLabel)}
                  onCheckedChange={(checked) => handleProductChange(fullLabel, checked as boolean)}
                  className="mt-0.5"
                />
                <Label htmlFor={`product-${idx}`} className="cursor-pointer">
                  <span className="text-sm font-semibold text-black block">{product.code}</span>
                  {product.label && (
                    <span className="text-xs text-gray-500">{product.label}</span>
                  )}
                </Label>
              </div>
            );
          })}
        </div>
        {errors.products && (
          <div className="flex items-center gap-1.5 mt-2">
            <ErrorIcon className="h-4 w-4 shrink-0" />
            <p className="text-sm text-om-error font-medium">{errors.products}</p>
          </div>
        )}
      </div>

      <div className="border-t border-gray-200 mb-8" />

      <div className="mb-8">
        <h3 className="text-base font-bold text-black mb-1">
          {requiredLabel('Scheme Numbers/Investment Numbers/Policy Numbers', 'schemeNumbers')}
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Add each scheme, investment, or policy number individually
        </p>

        {formData.schemeNumbers.map((scheme, index) => (
          <div
            key={index}
            className="flex items-center mb-3 p-3 border border-gray-200 rounded-lg bg-gray-50"
          >
            <span className="font-bold text-gray-500 mr-2">
              #{index + 1}
            </span>
            <Input
              value={scheme}
              onChange={(e) => updateSchemeNumber(index, e.target.value)}
              placeholder="Enter scheme/investment/policy number"
              className="mr-2"
              maxLength={50}
            />
            <Button
              variant="destructive"
              size="sm"
              onClick={() => removeSchemeNumber(index)}
              className="px-3 shrink-0"
            >
              <X className="h-4 w-4 mr-1" />
              Remove
            </Button>
          </div>
        ))}

        <Button
          onClick={addSchemeNumber}
          className="w-full sm:w-auto bg-gradient-to-r from-om-gradient-start to-om-gradient-end hover:from-om-gradient-hover-start hover:to-om-gradient-hover-end"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Scheme Number
        </Button>

        {formData.schemeNumbers.length > 0 && (
          <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-gray-700">
              <strong>Summary:</strong> {formData.schemeNumbers.filter((s) => s.trim()).length} scheme number(s) added
              {formData.schemeNumbers.filter((s) => !s.trim()).length > 0 && (
                <span className="text-amber-700 ml-2">
                  ({formData.schemeNumbers.filter((s) => !s.trim()).length} empty)
                </span>
              )}
            </p>
          </div>
        )}

        {errors.schemeNumbers && (
          <div className="flex items-center gap-1.5 mt-2">
            <ErrorIcon className="h-4 w-4 shrink-0" />
            <p className="text-sm text-om-error font-medium">{errors.schemeNumbers}</p>
          </div>
        )}
      </div>

      <div className="border-t border-gray-200 mb-8" />

      <div className="mb-4">
        <FloatingSelect
          label={requiredLabel('Identification Document', 'identificationDocument')}
          value={formData.identificationDocument}
          onValueChange={(value: string) => handleInputChange('identificationDocument', value)}
          error={!!errors.identificationDocument}
        >
          {ID_DOCUMENT_OPTIONS.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </FloatingSelect>
        {errors.identificationDocument && (
          <div className="flex items-center gap-1.5 mt-1">
            <ErrorIcon className="h-4 w-4 shrink-0" />
            <p className="text-sm text-om-error font-medium">{errors.identificationDocument}</p>
          </div>
        )}
      </div>

      <FileUploadArea
        label="identification document file"
        field="documents.identification"
        error={errors.identificationFile}
        fileSelections={fileSelections}
        fileInputRefs={fileInputRefs}
        handleFileChange={handleFileChange}
      />
    </div>
  );
};
