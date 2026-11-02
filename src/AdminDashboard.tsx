import { useEffect, useMemo, useState, type FormEvent } from 'react'
import {
  deleteTrip, fetchTrips, getPublicFile, readSession, saveTrip, signIn, signOut, supabaseReady, uploadFile,
  type AuthSession, type ManagedTrip, type TripCategory,
} from './lib/supabase'

type SeedTrip = ManagedTrip
const categories: { id: TripCategory; title: string }[] = [
  { id: 'domestic', title: 'Domestic' }, { id: 'international', title: 'International' }, { id: 'pilgrimage', title: 'Pilgrimage' },
]

function emptyTrip(category: TripCategory = 'domestic'): ManagedTrip {
  return { id: '', category, name_en: '', name_mr: '', thumbnail_path: '', itinerary_en_path: null, itinerary_mr_path: null, published: true, sort_order: 100 }
}

function slugify(value: string) {
  return value.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export function createAdminSeed(trips: { category: TripCategory; items: { id: string; en: string; mr: string; thumbnail: string; english?: string; marathi?: string }[] }[]): SeedTrip[] {
  return trips.flatMap(({ category, items }) => items.map((trip, index) => {
    const staticPath = (path?: string) => path ? `site-assets:assets/${path}` : null
    const base = `${import.meta.env.BASE_URL}assets/`
    const thumbnailPath = trip.thumbnail.startsWith(base) ? `site-assets:${decodeURI(trip.thumbnail.slice(base.length))}` : trip.thumbnail
    return {
      id: trip.id, category, name_en: trip.en, name_mr: trip.mr, thumbnail_path: thumbnailPath,
      itinerary_en_path: staticPath(trip.english), itinerary_mr_path: staticPath(trip.marathi),
      published: true, sort_order: index * 10,
    }
  }))
}

export default function AdminDashboard({ initialTrips }: { initialTrips: SeedTrip[] }) {
  const [session, setSession] = useState<AuthSession | null>(() => readSession())
  const [rows, setRows] = useState<ManagedTrip[]>([])
  const [form, setForm] = useState<ManagedTrip>(() => emptyTrip())
  const [thumbFile, setThumbFile] = useState<File | null>(null)
  const [englishFile, setEnglishFile] = useState<File | null>(null)
  const [marathiFile, setMarathiFile] = useState<File | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [query, setQuery] = useState('')

  const reload = async (accessToken: string) => setRows(await fetchTrips(accessToken))
  useEffect(() => { if (session) reload(session.access_token).catch(e => setError(e.message)) }, [session])

  const combinedRows = useMemo(() => {
    const merged = new Map(initialTrips.map(trip => [trip.id, trip]))
    for (const trip of rows) merged.set(trip.id, trip)
    return [...merged.values()].filter(trip => `${trip.name_en} ${trip.name_mr} ${trip.category}`.toLowerCase().includes(query.toLowerCase()))
      .sort((a, b) => a.category.localeCompare(b.category) || a.sort_order - b.sort_order || a.name_en.localeCompare(b.name_en))
  }, [initialTrips, rows, query])

  const startNew = () => { setForm(emptyTrip()); setThumbFile(null); setEnglishFile(null); setMarathiFile(null); setError(''); setNotice('') }
  const edit = (trip: ManagedTrip) => { setForm({ ...trip }); setThumbFile(null); setEnglishFile(null); setMarathiFile(null); setError(''); setNotice('') }
  const update = <K extends keyof ManagedTrip>(key: K, value: ManagedTrip[K]) => setForm(current => ({ ...current, [key]: value }))

  const handleLogin = async (event: FormEvent) => {
    event.preventDefault(); setBusy(true); setError('')
    try { setSession(await signIn(email.trim(), password)) } catch (e) { setError(e instanceof Error ? e.message : 'Unable to sign in.') }
    finally { setBusy(false) }
  }

  const handleSave = async (event: FormEvent) => {
    event.preventDefault()
    if (!session) return
    const tripId = form.id.trim() || slugify(form.name_en)
    if (!tripId) { setError('Add an English destination name so the trip can get an ID.'); return }
    setBusy(true); setError(''); setNotice('')
    try {
      const thumbnail = thumbFile ? await uploadFile(thumbFile, session.access_token) : form.thumbnail_path
      if (!thumbnail) throw new Error('Choose a thumbnail photo.')
      const english = englishFile ? await uploadFile(englishFile, session.access_token) : form.itinerary_en_path
      const marathi = marathiFile ? await uploadFile(marathiFile, session.access_token) : form.itinerary_mr_path
      const record: ManagedTrip = { ...form, id: tripId, thumbnail_path: thumbnail, itinerary_en_path: english || null, itinerary_mr_path: marathi || null }
      await saveTrip(record, session.access_token)
      await reload(session.access_token)
      setForm(record); setThumbFile(null); setEnglishFile(null); setMarathiFile(null)
      setNotice('Trip saved. Changes are now available on the public website.')
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to save this trip.') }
    finally { setBusy(false) }
  }

  const handleDelete = async (trip: ManagedTrip) => {
    if (!session || !window.confirm(`Remove “${trip.name_en}” from the destination list?`)) return
    setBusy(true); setError(''); setNotice('')
    try {
      if (initialTrips.some(item => item.id === trip.id)) {
        await saveTrip({ ...trip, published: false }, session.access_token)
        await reload(session.access_token)
        setNotice('Destination hidden from the public website.')
      } else {
        await deleteTrip(trip.id, session.access_token)
        setRows(current => current.filter(row => row.id !== trip.id))
        setNotice('Saved destination entry removed.')
      }
      if (form.id === trip.id) startNew()
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to remove this trip.') }
    finally { setBusy(false) }
  }

  if (!supabaseReady) return <main className="admin-page"><section className="admin-card"><span className="admin-kicker">Arth Travels</span><h1>Admin setup needed</h1><p>Add the Supabase Project URL and publishable key as deployment environment variables, then reload.</p></section></main>
  if (!session) return <main className="admin-page"><form className="admin-card admin-login" onSubmit={handleLogin}>
    <a className="admin-back" href="#/">← Back to website</a><span className="admin-kicker">Arth Travels · Private</span><h1>Admin sign in</h1>
    <p>Use the administrator email and password created in Supabase Authentication.</p>
    <label>Email<input type="email" autoComplete="username" required value={email} onChange={e => setEmail(e.target.value)} /></label>
    <label>Password<input type="password" autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)} /></label>
    {error && <div className="admin-message is-error" role="alert">{error}</div>}
    <button className="admin-primary" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
  </form></main>

  return <main className="admin-page admin-workspace"><header className="admin-topbar"><a className="admin-back" href="#/">← Public website</a><div><span className="admin-kicker">Arth Travels · Admin</span><h1>Manage destinations</h1></div><button className="admin-secondary" onClick={() => { signOut(); setSession(null) }}>Sign out</button></header>
    <div className="admin-layout"><section className="admin-list"><div className="admin-list__top"><div><span className="admin-kicker">Tour library</span><h2>{combinedRows.length} destinations</h2></div><button className="admin-primary" onClick={startNew}>＋ Add destination</button></div>
      <input className="admin-search" type="search" placeholder="Search destinations" value={query} onChange={e => setQuery(e.target.value)} />
      <div className="admin-trip-list">{combinedRows.map(trip => <button className={`admin-trip ${form.id === trip.id ? 'is-selected' : ''}`} key={trip.id} onClick={() => edit(trip)}>
        <img src={getPublicFile(trip.thumbnail_path)} alt="" /><span><small>{categories.find(c => c.id === trip.category)?.title} {rows.some(row => row.id === trip.id) ? '· Saved' : '· Site default'}</small><strong>{trip.name_en}</strong></span><i className={trip.published ? 'is-published' : ''}>{trip.published ? 'Live' : 'Hidden'}</i>
      </button>)}</div>
    </section>
    <form className="admin-editor" onSubmit={handleSave}><div className="admin-editor__heading"><div><span className="admin-kicker">Trip details</span><h2>{form.id ? 'Edit destination' : 'Add a destination'}</h2></div>{form.id && rows.some(row => row.id === form.id) && <button type="button" className="admin-delete" disabled={busy} onClick={() => handleDelete(form)}>Remove</button>}</div>
      <div className="admin-fields admin-fields--two"><label>Category<select value={form.category} onChange={e => update('category', e.target.value as TripCategory)}>{categories.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}</select></label><label>Sort order<input type="number" value={form.sort_order} onChange={e => update('sort_order', Number(e.target.value))} /></label></div>
      <div className="admin-fields admin-fields--two"><label>Name in English<input required value={form.name_en} onChange={e => { update('name_en', e.target.value); if (!form.id) update('id', slugify(e.target.value)) }} /></label><label>Name in Marathi<input value={form.name_mr} onChange={e => update('name_mr', e.target.value)} /></label></div>
      <label className="admin-file">Destination thumbnail<input required={!form.thumbnail_path && !thumbFile} type="file" accept="image/*" onChange={e => setThumbFile(e.target.files?.[0] || null)} /><small>{thumbFile?.name || (form.thumbnail_path ? 'Current image kept unless you choose a replacement.' : 'Choose a JPG, PNG or WebP photo.')}</small></label>
      <div className="admin-fields admin-fields--two"><label className="admin-file">English itinerary poster<input type="file" accept="image/*" onChange={e => setEnglishFile(e.target.files?.[0] || null)} /><small>{englishFile?.name || (form.itinerary_en_path ? 'Current itinerary poster is set.' : 'Optional')}</small></label><label className="admin-file">Marathi itinerary poster<input type="file" accept="image/*" onChange={e => setMarathiFile(e.target.files?.[0] || null)} /><small>{marathiFile?.name || (form.itinerary_mr_path ? 'Current itinerary poster is set.' : 'Optional')}</small></label></div>
      <label className="admin-toggle"><input type="checkbox" checked={form.published} onChange={e => update('published', e.target.checked)} /><span><strong>Show on public website</strong><small>Unpublished destinations stay in this dashboard.</small></span></label>
      {error && <div className="admin-message is-error" role="alert">{error}</div>}{notice && <div className="admin-message" role="status">{notice}</div>}
      <button className="admin-primary admin-save" disabled={busy}>{busy ? 'Saving…' : 'Save destination'}</button>
    </form></div>
  </main>
}
