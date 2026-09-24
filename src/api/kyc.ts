import client from './client'

/**
 * Public KYC form submission (no auth — see `src/api/client.ts`).
 * Paths are relative to `VITE_API_URL`, which carries the route prefix, e.g.
 * `http://localhost:5000/api` + `/kyc/submit` or `https://api.example.com` + `/kyc/submit`.
 * Matches `POST {{baseUrl}}/kyc/submit` in the Postman collection.
 */
export const KYC_SUBMIT_PATH = '/kyc/submit'

/**
 * Submit a completed KYC form. The payload is `multipart/form-data` with the
 * text fields `type`, `clientName`, `formData` (JSON string) plus one part per
 * attached document. Content-Type is deliberately left unset so axios can
 * attach the multipart boundary.
 */
export function submitKyc(payload: FormData) {
  return client.post(KYC_SUBMIT_PATH, payload)
}
