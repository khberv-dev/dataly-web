import axios from 'axios'
import toaster from './toaster'

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000',
})

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

client.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status

    if (status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
      return Promise.reject(err)
    }

    const raw = err.response?.data?.message ?? err.message ?? 'Request failed'
    const message = Array.isArray(raw) ? raw.join(', ') : raw

    toaster.add({
      name: `error-${Date.now()}`,
      title: status ? `Error ${status}` : 'Error',
      content: message,
      theme: 'danger',
      autoHiding: 5000,
    })

    return Promise.reject(err)
  },
)

export default client
