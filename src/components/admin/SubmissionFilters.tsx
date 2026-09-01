import React from 'react';
import { FloatingInput } from '../ui/floating-input';
import { FloatingSelect } from '../ui/floating-select';
import { FloatingDate } from '../ui/floating-date';
import { SelectItem } from '../ui/select';
import { Download, X } from 'lucide-react';

interface SubmissionFiltersProps {
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  typeFilter: string;
  onTypeFilterChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  lifecycleFilter: string;
  onLifecycleFilterChange: (value: string) => void;
  dateFrom: string;
  onDateFromChange: (value: string) => void;
  dateTo: string;
  onDateToChange: (value: string) => void;
  onClearFilters: () => void;
  onExport: () => void;
  exportDisabled: boolean;
}

const SubmissionFilters: React.FC<SubmissionFiltersProps> = ({
  searchTerm,
  onSearchTermChange,
  typeFilter,
  onTypeFilterChange,
  statusFilter,
  onStatusFilterChange,
  lifecycleFilter,
  onLifecycleFilterChange,
  dateFrom,
  onDateFromChange,
  dateTo,
  onDateToChange,
  onClearFilters,
  onExport,
  exportDisabled
}) => (
  <div className="border border-gray-200 rounded-xl p-6 bg-white">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {/* Search by Name */}
      <FloatingInput
        id="searchTerm"
        label="Search by Name"
        value={searchTerm}
        onChange={(e) => onSearchTermChange(e.target.value)}
        maxLength={100}
      />

      {/* KYC Type */}
      <FloatingSelect
        label="KYC Type"
        value={typeFilter}
        onValueChange={onTypeFilterChange}
      >
        <SelectItem value="all">All Types</SelectItem>
        <SelectItem value="individual">Individual</SelectItem>
        <SelectItem value="group">Group</SelectItem>
        <SelectItem value="corporate">Corporate</SelectItem>
      </FloatingSelect>

      {/* Status */}
      <FloatingSelect
        label="Status"
        value={statusFilter}
        onValueChange={onStatusFilterChange}
      >
        <SelectItem value="all">All Statuses</SelectItem>
        <SelectItem value="pending">Pending</SelectItem>
        <SelectItem value="under_review">Under Review</SelectItem>
        <SelectItem value="approved">Approved</SelectItem>
        <SelectItem value="rejected">Rejected</SelectItem>
        <SelectItem value="needs_info">Needs Info</SelectItem>
        <SelectItem value="escalated">Escalated</SelectItem>
      </FloatingSelect>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {/* Lifecycle */}
      <FloatingSelect
        label="Lifecycle"
        value={lifecycleFilter}
        onValueChange={onLifecycleFilterChange}
      >
        <SelectItem value="all">All Lifecycle States</SelectItem>
        <SelectItem value="due_soon">Due Soon</SelectItem>
        <SelectItem value="expired">Expired</SelectItem>
        <SelectItem value="pending_update">Pending Update</SelectItem>
        <SelectItem value="pending_review">Update Pending Review</SelectItem>
      </FloatingSelect>

      {/* Date From */}
      <FloatingDate
        id="dateFrom"
        label="Date From"
        value={dateFrom}
        onChange={onDateFromChange}
      />

      {/* Date To */}
      <FloatingDate
        id="dateTo"
        label="Date To"
        value={dateTo}
        onChange={onDateToChange}
      />
    </div>

    {/* Action Buttons */}
    <div className="flex justify-end items-center gap-3">
      <button
        onClick={onClearFilters}
        className="flex items-center gap-2 px-6 py-2.5 rounded-full border border-green-600 text-green-600 font-semibold text-sm hover:bg-green-50 transition-colors"
      >
        <X className="w-4 h-4" />
        Clear Filters
      </button>

      <button
        onClick={onExport}
        disabled={exportDisabled}
        className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-semibold text-sm transition-colors ${
          exportDisabled
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-gradient-to-r from-om-gradient-start to-om-gradient-end hover:from-om-gradient-hover-start hover:to-om-gradient-hover-end text-white'
        }`}
      >
        <Download className="w-4 h-4" />
        Export to Excel
      </button>
    </div>
  </div>
);

export default SubmissionFilters;
