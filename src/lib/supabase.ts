export type TripCategory = 'domestic' | 'international' | 'mice' | 'pilgrimage'

export type ManagedTrip = {
  id: string
  category: TripCategory
  name_en: string
  name_mr: string
  thumbnail_path: string
  itinerary_en_path: string | null
  itinerary_mr_path: string | null
  published: boolean
  sort_order: number
  created_at?: string
}

export type ManagedMemory = {
  id: string
  title_en: string
  title_mr: string
  video_path: string
  published: boolean
  sort_order: number
  created_at?: string
}

const projectUrl = import.meta.env.VITE_SUPABASE_URL?.replace(/\/$/, '')
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
export const supabaseReady = Boolean(projectUrl && publishableKey)

const authStorageKey = 'arth-travels-admin-session'

export type AuthSession = { access_token: string; refresh_token: string; user: { id: string; email: string } }

export function readSession(): AuthSession | null {
  try {
    const session = JSON.parse(localStorage.getItem(authStorageKey) || 'null') as AuthSession | null
    if (session && session.access_token) return session
  } catch { /* Ignore a malformed or stale local session. */ }
  return null
}

function saveSession(session: AuthSession | null) {
  if (session) localStorage.setItem(authStorageKey, JSON.stringify(session))
  else localStorage.removeItem(authStorageKey)
}

async function request<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
  if (!projectUrl || !publishableKey) throw new Error('Supabase environment variables are missing.')
  const response = await fetch(`${projectUrl}${path}`, {
    ...options,
    headers: {
      apikey: publishableKey,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.body && !(options.body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
  })
  if (!response.ok) {
    const body = await response.text()
    let message = body
    try { message = JSON.parse(body).msg || JSON.parse(body).message || body } catch { /* Keep response text. */ }
    throw new Error(message || `Supabase request failed (${response.status}).`)
  }
  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}

export async function signIn(email: string, password: string) {
  const session = await request<AuthSession>('/auth/v1/token?grant_type=password', {
    method: 'POST', body: JSON.stringify({ email, password }),
  })
  saveSession(session)
  return session
}

export function signOut() { saveSession(null) }

export function getPublicFile(path: string | null | undefined) {
  if (!path) return ''
  if (/^https?:\/\//i.test(path)) return path
  if (path.startsWith('site-assets:')) return `${import.meta.env.BASE_URL}${encodeURI(path.slice('site-assets:'.length).replace(/^\/+/, ''))}`
  if (!projectUrl) return ''
  return `${projectUrl}/storage/v1/object/public/trip-media/${path.split('/').map(encodeURIComponent).join('/')}`
}

export async function fetchPublishedTrips(): Promise<ManagedTrip[]> {
  if (!supabaseReady) return []
  return request<ManagedTrip[]>('/rest/v1/trips?select=*&order=sort_order.asc,created_at.desc')
}

export async function fetchTrips(token: string): Promise<ManagedTrip[]> {
  return request<ManagedTrip[]>('/rest/v1/trips?select=*&order=category.asc,sort_order.asc,created_at.desc', {}, token)
}

export async function saveTrip(trip: Omit<ManagedTrip, 'created_at'>, token: string) {
  return request<ManagedTrip[]>('/rest/v1/trips?on_conflict=id', {
    method: 'POST', headers: { Prefer: 'resolution=merge-duplicates,return=representation' }, body: JSON.stringify(trip),
  }, token)
}

export async function deleteTrip(id: string, token: string) {
  return request<void>(`/rest/v1/trips?id=eq.${encodeURIComponent(id)}`, { method: 'DELETE' }, token)
}

export async function fetchMemories(): Promise<ManagedMemory[]> {
  if (!supabaseReady) return []
  return request<ManagedMemory[]>('/rest/v1/travel_memories?select=*&order=sort_order.asc,created_at.desc')
}

export async function fetchAdminMemories(token: string): Promise<ManagedMemory[]> {
  return request<ManagedMemory[]>('/rest/v1/travel_memories?select=*&order=sort_order.asc,created_at.desc', {}, token)
}

export async function saveMemory(memory: Omit<ManagedMemory, 'created_at'>, token: string) {
  return request<ManagedMemory[]>('/rest/v1/travel_memories?on_conflict=id', {
    method: 'POST', headers: { Prefer: 'resolution=merge-duplicates,return=representation' }, body: JSON.stringify(memory),
  }, token)
}

export async function deleteMemory(id: string, token: string) {
  return request<void>(`/rest/v1/travel_memories?id=eq.${encodeURIComponent(id)}`, { method: 'DELETE' }, token)
}

export async function deleteUploadedFile(path: string | null | undefined, token: string) {
  if (!path || path.startsWith('site-assets:') || /^https?:\/\//i.test(path)) return
  await request(`/storage/v1/object/trip-media/${path.split('/').map(encodeURIComponent).join('/')}`, { method: 'DELETE' }, token)
}

export async function uploadFile(file: File, token: string, folder = 'trips') {
  if (file.size > 50 * 1024 * 1024) throw new Error('File is larger than the 50 MB upload limit.')
  const safeName = file.name.normalize('NFKD').replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/^-+|-+$/g, '') || 'upload'
  const path = `${folder}/${crypto.randomUUID()}-${safeName}`
  await request(`/storage/v1/object/trip-media/${path.split('/').map(encodeURIComponent).join('/')}`, {
    method: 'POST', headers: { 'Content-Type': file.type || 'application/octet-stream', 'x-upsert': 'false' }, body: file,
  }, token)
  return path
}
