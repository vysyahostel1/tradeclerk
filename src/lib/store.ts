import { create } from 'zustand'

export interface User {
  id: string
  email: string
  name: string | null
  role: string
  image?: string | null
  bio?: string | null
  expertise?: string | null
  company?: string | null
  karma?: number
}

interface AppState {
  user: User | null
  isAuthenticated: boolean
  token: string | null
  currentPage: string
  pageParams: Record<string, string>
  sidebarOpen: boolean
  searchQuery: string

  setUser: (user: User | null) => void
  setToken: (token: string | null) => void
  navigate: (page: string, params?: Record<string, string>) => void
  logout: () => void
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  setSearchQuery: (query: string) => void
  initialize: () => void
}

const getStored = (key: string): string | null => {
  if (typeof window === 'undefined') return null
  try {
    return localStorage.getItem(`tc_${key}`)
  } catch {
    return null
  }
}

const setStored = (key: string, value: string) => {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(`tc_${key}`, value)
  } catch {
    // ignore
  }
}

export const useStore = create<AppState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  token: null,
  currentPage: 'home',
  pageParams: {},
  sidebarOpen: false,
  searchQuery: '',

  setUser: (user) => {
    set({ user, isAuthenticated: !!user })
    if (user) setStored('user', JSON.stringify(user))
    else localStorage.removeItem('tc_user')
  },

  setToken: (token) => {
    set({ token })
    if (token) setStored('token', token)
    else localStorage.removeItem('tc_token')
  },

  navigate: (page, params = {}) => {
    set({ currentPage: page, pageParams: params })
    window.location.hash = params.id ? `#${page}/${params.id}` : `#${page}`
    window.scrollTo({ top: 0, behavior: 'smooth' })
  },

  logout: () => {
    set({ user: null, isAuthenticated: false, token: null, currentPage: 'home' })
    localStorage.removeItem('tc_user')
    localStorage.removeItem('tc_token')
    window.location.hash = '#home'
  },

  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setSearchQuery: (query) => set({ searchQuery: query }),

  initialize: () => {
    const token = getStored('token')
    const userStr = getStored('user')
    let user: User | null = null
    try {
      user = userStr ? JSON.parse(userStr) : null
    } catch {
      user = null
    }
    set({ token, user, isAuthenticated: !!user && !!token })

    // Hash-based routing
    const hash = window.location.hash.slice(1) || 'home'
    const segments = hash.split('/')
    const page = segments[0]
    const params: Record<string, string> = {}
    if (segments[1]) params.id = segments[1]
    set({ currentPage: page, pageParams: params })
  },
}))

// Helper: call API with auth
export async function apiFetch(
  path: string,
  options: RequestInit = {}
): Promise<{ data?: any; error?: string; status: number }> {
  const token = useStore.getState().token
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  try {
    const res = await fetch(path, { ...options, headers })
    const data = await res.json()
    if (!res.ok) {
      return { error: data.error || 'Request failed', status: res.status }
    }
    return { data, status: res.status }
  } catch (e: any) {
    return { error: e.message || 'Network error', status: 0 }
  }
}
