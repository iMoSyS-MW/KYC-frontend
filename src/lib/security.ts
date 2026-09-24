/**
 * Security utilities for the KYC frontend.
 */

/**
 * Sanitize an error message before displaying it to the user.
 * Prevents backend error details (stack traces, SQL, paths) from leaking to the UI.
 */
export function sanitizeErrorMessage(message: unknown): string {
  if (typeof message !== 'string') {
    return 'An unexpected error occurred. Please try again.';
  }

  // If the message looks like it contains a stack trace, SQL, or file paths,
  // replace it with a generic message.
  const sensitivePatterns = [
    /\bat\s+\S+:\d+:\d+\b/i,           // stack trace lines
    /\b(select|insert|update|delete|drop|create|alter)\b/gi, // SQL keywords
    /([a-z]:\\|[\\/])([\w\s.-]+[\\/])+/gi, // Windows/Unix paths
    /\bError:\s*\n/i,                   // Node.js error prefixes
    /\bprisma\b/i,                      // ORM leakage
    /\bsequelize\b/i,
    /\bmongoose\b/i,
    /\bconnection\s*(refused|timeout)\b/i,
    /\bETIMEDOUT\b/i,
    /\bECONNREFUSED\b/i,
    /\bENOENT\b/i,
  ];

  const looksSensitive = sensitivePatterns.some((p) => p.test(message));
  if (looksSensitive) {
    return 'An unexpected error occurred. Please try again or contact support.';
  }

  // Trim and cap length to prevent UI abuse
  const trimmed = message.trim();
  return trimmed.length > 300 ? trimmed.slice(0, 300) + '…' : trimmed;
}

/**
 * Decode a JWT token without verifying the signature (client-side only).
 * Returns the payload or null if parsing fails.
 */
export function decodeJwt(token: string): Record<string, unknown> | null {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

/**
 * Check whether a JWT token is expired based on its `exp` claim.
 * Returns true if expired or unparseable.
 */
export function isTokenExpired(token: string): boolean {
  const payload = decodeJwt(token);
  if (!payload || typeof payload.exp !== 'number') return true;
  // exp is in seconds; Date.now() is in milliseconds
  return payload.exp * 1000 < Date.now();
}

/**
 * Retrieve a CSRF token from the document's meta tag (if present).
 * The backend should inject this into the HTML response.
 */
export function getCsrfToken(): string | null {
  const meta = document.querySelector('meta[name="csrf-token"]');
  return meta?.getAttribute('content') || null;
}

/**
 * Allowed document types for KYC supporting-document uploads.
 * Client-side checks are best-effort UX/defense-in-depth only; the backend
 * MUST validate file signatures (magic bytes) before storing or serving files.
 */
export const ALLOWED_DOCUMENT_EXTENSIONS = ['.pdf', '.png', '.jpg', '.jpeg'] as const;

export const ALLOWED_DOCUMENT_MIME_TYPES = [
  'application/pdf',
  'image/png',
  'image/jpeg',
] as const;

export interface DocumentValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Best-effort validation for uploaded KYC documents.
 * Rejects oversized files and files whose extension, or (when the browser
 * reports one) MIME type, falls outside the PDF/PNG/JPG allowlist.
 */
export function validateDocumentFile(file: File, maxSizeMB = 10): DocumentValidationResult {
  const maxBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxBytes) {
    return { valid: false, error: `File size exceeds ${maxSizeMB} MB limit` };
  }

  const extension = getFileExtension(file.name);
  if (!extension || !(ALLOWED_DOCUMENT_EXTENSIONS as readonly string[]).includes(extension)) {
    return { valid: false, error: 'Only PDF, PNG or JPG files are allowed' };
  }

  if (file.type && !(ALLOWED_DOCUMENT_MIME_TYPES as readonly string[]).includes(file.type)) {
    return { valid: false, error: 'Only PDF, PNG or JPG files are allowed' };
  }

  return { valid: true };
}

function getFileExtension(name: string): string | null {
  const base = name.split('/').pop()?.split('\\').pop() ?? '';
  const dot = base.lastIndexOf('.');
  return dot <= 0 ? null : base.slice(dot).toLowerCase();
}

/** Upper bound for income/monetary amount inputs. */
export const MAX_INCOME_AMOUNT = 999999999.99;

/**
 * Clamp a raw number-input string to a non-negative monetary range.
 * `type="number"` inputs ignore the `maxlength` attribute, so values must be
 * bounded programmatically.
 */
export function clampNumericInput(value: string): string {
  if (typeof value !== 'string' || value.trim() === '') return value;
  const amount = Number(value);
  if (Number.isNaN(amount)) return value;
  return String(Math.min(Math.max(amount, 0), MAX_INCOME_AMOUNT));
}

/** Options for `sanitizeSubmitPayload`. */
export interface SanitizePayloadOptions {
  /** Maximum length for submitted strings (default 2000). */
  maxStringLength?: number;
  /** Per-key array length caps (e.g. `{ policyNumbers: 10 }`). */
  arrayLimits?: Record<string, number>;
}

const DEFAULT_MAX_STRING_LENGTH = 2000;
const DEFAULT_MAX_ARRAY_LENGTH = 100;

/**
 * Defense-in-depth sanitizer applied right before serializing the payload.
 * Trims/caps strings, and slices arrays to per-key limits. Files, numbers,
 * booleans and null pass through untouched. This guards against oversized
 * values injected through devtools or other bypasses of the field-level
 * `maxlength`/`min`/`max` constraints.
 */
export function sanitizeSubmitPayload(
  value: unknown,
  options: SanitizePayloadOptions = {},
): unknown {
  const maxStringLength = options.maxStringLength ?? DEFAULT_MAX_STRING_LENGTH;
  const arrayLimits = options.arrayLimits ?? {};

  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length > maxStringLength ? trimmed.slice(0, maxStringLength) : trimmed;
  }

  if (Array.isArray(value)) {
    return value
      .slice(0, DEFAULT_MAX_ARRAY_LENGTH)
      .map((item) => sanitizeSubmitPayload(item, options));
  }

  if (value && typeof value === 'object' && !(value instanceof Blob)) {
    const out: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value)) {
      if (Array.isArray(item)) {
        const limit = arrayLimits[key] ?? DEFAULT_MAX_ARRAY_LENGTH;
        out[key] = item.slice(0, limit).map((entry) => sanitizeSubmitPayload(entry, options));
      } else {
        out[key] = sanitizeSubmitPayload(item, options);
      }
    }
    return out;
  }

  return value;
}
