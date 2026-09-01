import React from 'react';
import { Input } from '../ui/input';
import { FloatingInput } from '../ui/floating-input';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { Plus, X } from 'lucide-react';
import { ErrorIcon } from './ErrorIcon';
import { StepProps, PRODUCTS, requiredLabel } from './types';

interface StepClientDetailsProps extends StepProps {
  handleProductChange: (product: string, checked: boolean) => void;
  addSchemeNumber: () => void;
  updateSchemeNumber: (index: number, value: string) => void;
  removeSchemeNumber: (index: number) => void;
}

export const StepClientDetails: React.FC<StepClientDetailsProps> = ({
  formData,
  errors,
  handleInputChange,
  handleProductChange,
  addSchemeNumber,
  updateSchemeNumber,
  removeSchemeNumber,
}) => {
  return (
    <div>
      <div className="mb-8">
        <FloatingInput
          id="groupName"
          label={requiredLabel('Group Name', 'groupName')}
          value={formData.groupName}
          onChange={(e) => handleInputChange('groupName', e.target.value)}
          error={!!errors.groupName}
          maxLength={200}
        />
      </div>

      <div className="border-t border-gray-200 mb-8" />

      <div className="mb-8">
        <h3 className="text-sm lg:text-base font-bold text-black mb-4">
          {requiredLabel('Products/Schemes (select at least one)', 'products')}
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
            <ErrorIcon />
            <p className="text-sm text-om-error font-medium">{errors.products}</p>
          </div>
        )}
      </div>

      <div className="border-t border-gray-200 pt-8">
        <h3 className="text-sm lg:text-base font-bold text-black mb-1">
          {requiredLabel('Scheme Numbers/Investment Numbers/Policy Numbers', 'schemeNumbers')}
        </h3>
        <p className="text-sm text-gray-500 mb-6">
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
              className="px-3"
            >
              <X className="h-4 w-4 mr-1" />
              Remove
            </Button>
          </div>
        ))}

        <Button
          onClick={addSchemeNumber}
          className="w-full sm:w-auto mt-2 bg-gradient-to-r from-om-gradient-start to-om-gradient-end hover:from-om-gradient-hover-start hover:to-om-gradient-hover-end"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Scheme Number
        </Button>

        {errors.schemeNumbers && (
          <div className="flex items-center gap-1.5 mt-2">
            <ErrorIcon />
            <p className="text-sm text-om-error font-medium">{errors.schemeNumbers}</p>
          </div>
        )}
      </div>
    </div>
  );
};
