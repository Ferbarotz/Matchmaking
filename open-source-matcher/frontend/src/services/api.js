import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT token from localStorage on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Auto-redirect on 401
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
}

// ── User ──────────────────────────────────────────────────────────────────────
export const userApi = {
  getProfile: () => api.get('/user/profile'),
  updateProfile: (data) => api.put('/user/profile', data),
  myTeams: () => api.get('/teams/my'),
}

// ── GitHub / Issues ───────────────────────────────────────────────────────────
export const githubApi = {
  searchIssues: (params) => api.get('/github/issues', { params }),
  importIssue: (data) => api.post('/issues/import', data),
  listLocalIssues: (params) => api.get('/issues', { params }),
}

// ── Teams ─────────────────────────────────────────────────────────────────────
export const teamApi = {
  create: (data) => api.post('/teams', data),
  list: (params) => api.get('/teams', { params }),
  get: (id) => api.get(`/teams/${id}`),
  join: (id, data) => api.post(`/teams/${id}/join`, data),
  updateStatus: (id, data) => api.patch(`/teams/${id}/status`, data),
}
