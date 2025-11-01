const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('token')
}

export function setToken(token: string) {
  if (typeof window === 'undefined') return
  localStorage.setItem('token', token)
}

export function removeToken() {
  if (typeof window === 'undefined') return
  localStorage.removeItem('token')
}

async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const token = getToken()
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(error.error || 'Request failed')
  }

  return response.json()
}

export const api = {
  auth: {
    register: async (email: string, password: string, name?: string) => {
      return fetchAPI('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, name }),
      })
    },
    login: async (email: string, password: string) => {
      const data = await fetchAPI('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })
      if (data.token) {
        setToken(data.token)
      }
      return data
    },
    logout: () => {
      removeToken()
      window.location.href = '/login'
    },
  },
  songs: {
    list: async (search?: string, status?: string) => {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (status) params.set('status', status)
      const query = params.toString()
      return fetchAPI(`/api/songs${query ? `?${query}` : ''}`)
    },
    upload: async (file: File) => {
      const formData = new FormData()
      formData.append('file', file)
      const token = getToken()
      const response = await fetch(`${API_URL}/api/songs/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Upload failed' }))
        throw new Error(error.error || 'Upload failed')
      }
      return response.json()
    },
    stream: (id: string) => {
      return `${API_URL}/api/songs/${id}/stream`
    },
  },
  playlists: {
    list: async () => {
      return fetchAPI('/api/playlists')
    },
    get: async (id: string) => {
      return fetchAPI(`/api/playlists/${id}`)
    },
    create: async (name: string, description?: string) => {
      return fetchAPI('/api/playlists', {
        method: 'POST',
        body: JSON.stringify({ name, description }),
      })
    },
    delete: async (id: string) => {
      return fetchAPI(`/api/playlists/${id}`, {
        method: 'DELETE',
      })
    },
    addSong: async (playlistId: string, songId: string) => {
      return fetchAPI(`/api/playlists/${playlistId}/songs`, {
        method: 'POST',
        body: JSON.stringify({ songId }),
      })
    },
    removeSong: async (playlistId: string, songId: string) => {
      return fetchAPI(`/api/playlists/${playlistId}/songs?songId=${songId}`, {
        method: 'DELETE',
      })
    },
  },
}
