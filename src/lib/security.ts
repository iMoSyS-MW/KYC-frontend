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
    /([a-z]:\\|\\|\/)([\w\s.-]+\\|\/)+/gi, // Windows/Unix paths
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
 * Default toastr configuration with HTML escaping enabled.
 */
export const defaultToastrOptions = {
  closeButton: true,
  debug: false,
  newestOnTop: true,
  progressBar: true,
  positionClass: 'toast-top-right',
  preventDuplicates: false,
  onclick: null,
  showDuration: '300',
  hideDuration: '1000',
  timeOut: '5000',
  extendedTimeOut: '1000',
  showEasing: 'swing',
  hideEasing: 'linear',
  showMethod: 'fadeIn',
  hideMethod: 'fadeOut',
  escapeHtml: true,
};
