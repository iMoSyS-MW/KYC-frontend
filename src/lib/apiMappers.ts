/**
 * The API serves PostgreSQL rows in snake_case, while the UI was written against the
 * earlier MongoDB schema (`_id`, camelCase, a nested `clientId` object). These mappers
 * translate API responses into the shape the components read, so the field names stay
 * in one place rather than being spread across every call site.
 */

/**
 * Postgres enum arrays (`admin_role[]`, `kyc_type[]`) arrive as literal strings such as
 * `'{admin,reviewer}'` because node-postgres does not parse arrays of custom types.
 */
export function parsePgArray(value: unknown): string[] {
  if (Array.isArray(value)) return value as string[];
  if (typeof value !== 'string') return [];

  const inner = value.trim().replace(/^\{/, '').replace(/\}$/, '');
  if (!inner) return [];

  return inner
    .split(',')
    .map(entry => entry.trim().replace(/^"(.*)"$/, '$1'))
    .filter(Boolean);
}

function mapKycLifecycle(lifecycle: any) {
  if (!lifecycle || typeof lifecycle !== 'object') return {};

  return {
    ...lifecycle,
    dueSoon: lifecycle.due_soon,
    expired: lifecycle.expired,
    pendingUpdate: lifecycle.pending_update,
    pendingUpdateReason: lifecycle.pending_update_reason,
    pendingUpdateStatus: lifecycle.pending_update_status,
    pendingUpdateRequestedBy: lifecycle.pending_update_requested_by,
    pendingUpdateRequestedAt: lifecycle.pending_update_requested_at,
  };
}

export function mapSubmission(row: any) {
  return {
    ...row,
    _id: row.id,
    submittedAt: row.submitted_at,
    updatedAt: row.updated_at,
    formData: row.form_data ?? {},
    clientId: {
      name: row.client_name,
      type: row.type,
      contact: {
        phone: row.contact_phone,
        email: row.contact_email,
        address: row.contact_address,
      },
    },
    sla: row.sla_days,
    slaDeadline: row.sla_deadline,
    slaBreached: row.sla_breached,
    reviewCycleMonths: row.review_cycle_months,
    statusHistory: row.status_history ?? [],
    auditTrail: row.audit_trail ?? [],
    updateRequests: row.update_requests ?? [],
    kycLifecycle: mapKycLifecycle(row.kyc_lifecycle),
    lastApprovedAt: row.last_approved_at,
    nextReviewDueAt: row.next_review_due_at,
    kycExpiresAt: row.kyc_expires_at,
  };
}

export function mapActivity(row: any) {
  return {
    ...row,
    _id: row.id,
    createdAt: row.created_at,
    ipAddress: row.ip_address,
    // The API joins admins to expose actor/target usernames; expose them as the
    // nested shape the table reads (`actorUserId.username`).
    actorUserId: row.actor_username ? { username: row.actor_username } : null,
    targetUserId: row.target_username ? { username: row.target_username } : null,
  };
}

export function mapUser(row: any) {
  return {
    ...row,
    _id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    isActive: row.is_active,
    lastLogin: row.last_login,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    passwordChangedAt: row.password_changed_at,
    mustChangePassword: row.must_change_password,
    roles: parsePgArray(row.roles),
    accessTypes: parsePgArray(row.access_types),
  };
}
