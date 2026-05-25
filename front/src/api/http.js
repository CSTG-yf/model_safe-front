import axios from 'axios'
import { useCounterStore } from '@/stores/counterStore'

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api'

export const http = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

export function unwrapResponse(response) {
  const body = response.data
  if (body && Object.prototype.hasOwnProperty.call(body, 'code')) {
    if (body.code !== 'success') {
      throw new Error(body.message || '请求失败')
    }
    return body.data
  }
  return body
}

http.interceptors.request.use((config) => {
  const store = useCounterStore()
  if (store.isLoggedIn()) {
    config.headers.Authorization = `Bearer ${store.access}`
  }
  return config
})

http.interceptors.response.use(
  (response) => response,
  async (error) => {
    const store = useCounterStore()
    const originalRequest = error.config || {}
    const status = error.response?.status

    if (status === 401 && store.isLoggedIn() && store.refresh && !originalRequest._retry) {
      originalRequest._retry = true
      try {
        const refreshResponse = await axios.post(`${API_BASE_URL}/users/token/refresh/`, {
          refresh: store.refresh
        })
        const access = refreshResponse.data.access
        store.access = access
        localStorage.setItem('access', access)
        originalRequest.headers.Authorization = `Bearer ${access}`
        return http(originalRequest)
      } catch (refreshError) {
        store.clearUserInfo()
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    if (status === 401) {
      store.clearUserInfo()
      window.location.href = '/login'
    }

    return Promise.reject(error)
  }
)

export async function getData(url, config) {
  return unwrapResponse(await http.get(url, config))
}

export async function postData(url, data, config) {
  return unwrapResponse(await http.post(url, data, config))
}

export async function putData(url, data, config) {
  return unwrapResponse(await http.put(url, data, config))
}

export async function deleteData(url, config) {
  return unwrapResponse(await http.delete(url, config))
}
