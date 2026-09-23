import axios from 'axios'
import { getCsrfToken } from '../lib/security'

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 30000,
  withCredentials: true,
})

client.interceptors.request.use(
  (config) => {
    // Public KYC flows authenticate via the opaque `:token` route param, which is
    // passed to the API as a path segment. No Authorization header is required.

    // CSRF token for state-changing methods
    if (config.method && ['post', 'put', 'patch', 'delete'].includes(config.method.toLowerCase())) {
      const csrfToken = getCsrfToken()
      if (csrfToken) {
        config.headers = config.headers || {}
        config.headers['X-CSRF-Token'] = csrfToken
      }
    }

    return config
  },
  (error) => Promise.reject(error),
)

// Response interceptor: normalize the `{ success, data, pagination }` envelope
client.interceptors.response.use(
  (response) => {
    const payload = response.data as Record<string, unknown> | null
    if (payload && typeof payload === 'object' && 'success' in payload) {
      if (payload.success === true) {
        const envelope = payload as { data: unknown; pagination?: unknown }
        if ('pagination' in envelope) {
          ;(response as unknown as { pagination: unknown }).pagination = envelope.pagination
        }
        response.data = envelope.data
      }
    }
    return response
  },
  (error) => {
    // Normalize wrapped error envelope
    const payload = error.response?.data as Record<string, unknown> | null
    if (payload && typeof payload === 'object' && 'success' in payload) {
      const body = payload as { message?: string; errors?: unknown }
      const normalized: { message: string; errors?: unknown } = {
        message: body.message || 'An error occurred',
      }
      if (body.errors) normalized.errors = body.errors
      error.response.data = normalized
    }

    return Promise.reject(error)
  },
)

export default client
