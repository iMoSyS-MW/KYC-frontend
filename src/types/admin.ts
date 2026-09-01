export interface KycSubmission {
  _id: string;
  type: 'individual' | 'group' | 'corporate';
  status: 'pending' | 'approved' | 'rejected' | 'needs_info' | 'under_review' | 'escalated';
  submittedAt: string;
  updatedAt: string;
  clientId: {
    name: string;
    type: string;
    contact?: {
      phone?: string;
      email?: string;
      address?: string;
    };
  };
  formData: any;
  documents: Array<{
    name: string;
    path: string;
    type: string;
    uploadedAt: string;
  }>;
  // Phase 3 Enhanced Features
  statusHistory?: Array<{
    status: string;
    changedBy: string;
    changedAt: string;
    duration: number;
    comments?: string;
    slaMet?: boolean;
    nextAction?: string;
    dueDate?: string;
  }>;
  sla?: number;
  slaDeadline?: string;
  slaBreached?: boolean;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  workflow?: {
    currentStep: string;
    steps: Array<{
      name: string;
      status: string;
      startedAt?: string;
      completedAt?: string;
      sla?: number;
      comments?: string;
    }>;
    escalated?: boolean;
    escalatedTo?: string;
    escalatedAt?: string;
    escalationReason?: string;
  };
  auditTrail?: Array<{
    action: string;
    performedBy: string;
    performedAt: string;
    oldValue?: any;
    newValue?: any;
    details?: any;
    ipAddress?: string;
    userAgent?: string;
  }>;
  communications?: Array<{
    type: string;
    sentBy: string;
    sentTo: string;
    subject?: string;
    message: string;
    sentAt: string;
    readAt?: string;
    response?: string;
    responseAt?: string;
  }>;
  kycLifecycle?: {
    dueSoon?: boolean;
    expired?: boolean;
    isExpired?: boolean;
    pendingUpdate?: boolean;
    pendingUpdateReason?: string;
    pendingUpdateRequestedBy?: string;
    pendingUpdateRequestedAt?: string;
    pendingUpdateStatus?: 'pending_review' | 'approved' | 'rejected';
  };
  nextReviewDueAt?: string;
  kycExpiresAt?: string;
}

export interface DashboardStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  needsInfo: number;
}

export interface SystemSettings {
  sla: {
    individual: number;
    group: number;
    corporate: number;
  };
  priority: {
    individual: 'low' | 'medium' | 'high' | 'urgent';
    group: 'low' | 'medium' | 'high' | 'urgent';
    corporate: 'low' | 'medium' | 'high' | 'urgent';
  };
  reviewCycleMonths: {
    individual: number;
    group: number;
    corporate: number;
  };
  dueSoonDays: number;
  updatedAt?: string;
  updatedBy?: any;
}
