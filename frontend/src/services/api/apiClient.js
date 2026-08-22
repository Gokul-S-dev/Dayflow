import { useAuthStore } from '@/store/authStore'

const BASE_URL = import.meta.env.VITE_API_URL || '/api/v1'

/**
 * Standard API Client with auth token attachment and error normalization
 */
async function request(endpoint, { method = 'GET', data, headers = {}, ...customConfig } = {}) {
  const token = useAuthStore.getState().token
  const isFormData = data instanceof FormData

  const defaultHeaders = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...headers,
  }

  const config = {
    method,
    headers: defaultHeaders,
    ...customConfig,
  }

  if (data) {
    config.body = isFormData ? data : JSON.stringify(data)
  }

  const url = `${BASE_URL.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`

  try {
    const response = await fetch(url, config)

    // Handle 401 Unauthorized
    if (response.status === 401) {
      useAuthStore.getState().logout()
    }

    const responseData = await response.json().catch(() => null)

    if (!response.ok) {
      const error = new Error(responseData?.message || `HTTP Error ${response.status}: ${response.statusText}`)
      error.status = response.status
      error.data = responseData
      throw error
    }

    return responseData
  } catch (error) {
    return Promise.reject(error)
  }
}

export const apiClient = {
  get: (endpoint, config) => request(endpoint, { ...config, method: 'GET' }),
  post: (endpoint, data, config) => request(endpoint, { ...config, method: 'POST', data }),
  put: (endpoint, data, config) => request(endpoint, { ...config, method: 'PUT', data }),
  patch: (endpoint, data, config) => request(endpoint, { ...config, method: 'PATCH', data }),
  delete: (endpoint, config) => request(endpoint, { ...config, method: 'DELETE' }),
}
