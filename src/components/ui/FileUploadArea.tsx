import React, { useState, useEffect } from 'react';
import { FileText, Upload, Trash2, X } from 'lucide-react';

export interface FileSelections {
  [key: string]: File | null;
}

export interface FileInputRefs {
  [key: string]: React.RefObject<HTMLInputElement | null>;
}

interface FileUploadAreaProps {
  label: string;
  field: string;
  error?: string;
  fileSelections: FileSelections;
  fileInputRefs: FileInputRefs;
  handleFileChange: (field: string, files: FileList | null) => void;
  multiple?: boolean;
  maxSizeMB?: number;
}

const formatFileSize = (bytes?: number) => {
  if (!bytes) return '';
  const mb = bytes / (1024 * 1024);
  return mb < 1 ? `${Math.round(bytes / 1024)} KB` : `${mb.toFixed(2)} MB`;
};

export const FileUploadArea: React.FC<FileUploadAreaProps> = ({
  label,
  field,
  error,
  fileSelections,
  fileInputRefs,
  handleFileChange,
  multiple = false,
  maxSizeMB = 10,
}) => {
  const fileKey = field.split('.')[1] || field;
  const selectedFile = fileSelections[fileKey];
  const hasFile = Boolean(selectedFile);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [prevFileName, setPrevFileName] = useState<string | null>(null);
  const [sizeError, setSizeError] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const maxBytes = maxSizeMB * 1024 * 1024;
      if (file.size > maxBytes) {
        setSizeError(`File size exceeds ${maxSizeMB} MB limit`);
        e.target.value = '';
        return;
      }
      setSizeError(null);
    } else {
      setSizeError(null);
    }
    handleFileChange(field, files);
  };

  useEffect(() => {
    const currentFileName = selectedFile?.name || null;
    if (currentFileName && currentFileName !== prevFileName) {
      setPrevFileName(currentFileName);
      setIsUploading(true);
      setUploadProgress(0);

      const duration = 1500;
      const interval = 30;
      const steps = duration / interval;
      const increment = 100 / steps;
      let progress = 0;

      const timer = setInterval(() => {
        progress += increment;
        if (progress >= 100) {
          progress = 100;
          clearInterval(timer);
          setTimeout(() => {
            setIsUploading(false);
            setUploadProgress(0);
          }, 200);
        }
        setUploadProgress(Math.min(progress, 100));
      }, interval);

      return () => clearInterval(timer);
    } else if (!currentFileName) {
      setPrevFileName(null);
      setIsUploading(false);
      setUploadProgress(0);
    }
    // prevFileName is the comparison baseline this effect updates; including it would re-run the animation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFile?.name]);

  const displayError = error || sizeError;
  const isSuccess = hasFile && !displayError && !isUploading;

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSizeError(null);
    handleFileChange(field, null);
  };

  let containerClasses =
    'relative w-full overflow-hidden rounded-xl cursor-pointer flex items-center justify-between p-4 transition-all duration-200 ';

  if (displayError) {
    containerClasses += 'border-2 border-om-error bg-om-error/5';
  } else if (isSuccess) {
    containerClasses += 'border border-om-green bg-om-green/5';
  } else {
    containerClasses += 'border border-gray-300 bg-white hover:bg-gray-50 hover:border-om-green';
  }

  return (
    <div>
      <input
        ref={fileInputRefs[fileKey as keyof typeof fileInputRefs]}
        type="file"
        onChange={handleFileSelect}
        className="hidden"
        accept=".pdf,.png,.jpg,.jpeg"
        multiple={multiple}
      />

      <div
        onClick={() => fileInputRefs[fileKey as keyof typeof fileInputRefs]?.current?.click()}
        className={containerClasses}
      >
        <div className="flex items-center gap-3">
          <FileText
            className={`h-5 w-5 shrink-0 ${
              displayError ? 'text-om-error' : isSuccess ? 'text-om-green' : 'text-gray-500'
            }`}
          />
          <div>
            <p
              className={`text-sm font-medium ${
                hasFile ? 'text-gray-800' : 'text-gray-400'
              }`}
            >
              {selectedFile ? selectedFile.name : label}
            </p>

            {displayError ? (
              <p className="text-xs font-medium text-om-error">{displayError}</p>
            ) : isUploading ? (
              <p className="text-xs text-gray-400">Uploading...</p>
            ) : isSuccess ? (
              <p className="text-xs text-gray-400">{formatFileSize(selectedFile?.size)}</p>
            ) : (
              <p className="text-xs text-gray-400">PDF, PNG or JPG. Max {maxSizeMB} MB</p>
            )}
          </div>
        </div>

        {displayError ? (
          <X className="h-5 w-5 shrink-0 text-om-error" onClick={handleRemove} />
        ) : isUploading ? (
          <X className="h-5 w-5 shrink-0 text-gray-500" onClick={handleRemove} />
        ) : isSuccess ? (
          <Trash2 className="h-5 w-5 shrink-0 text-gray-500" onClick={handleRemove} />
        ) : (
          <Upload className="h-5 w-5 shrink-0 text-gray-500" />
        )}

        {isUploading && (
          <div className="absolute inset-x-0 bottom-0 h-1 bg-gray-100">
            <div
              className="h-full bg-om-green transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
};
