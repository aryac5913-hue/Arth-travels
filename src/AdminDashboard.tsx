import { useEffect, useMemo, useState, type FormEvent } from 'react'
import {
  deleteMemory, deleteTrip, deleteUploadedFile, fetchAdminMemories, fetchTrips, getPublicFile, readSession, saveMemory, saveTrip, signIn, signOut, supabaseReady, uploadFile,
  type AuthSession, type ManagedMemory, type ManagedTrip, type TripCategory,
} from './lib/supabase'

type SeedTrip = ManagedTrip
const categories: { id: TripCategory; title: string }[] = [
  { id: 'domestic', title: 'Domestic' }, { id: 'international', title: 'International' }, { id: 'mice', title: 'MICE' }, { id: 'pilgrimage', title: 'Pilgrimage' },
]

function emptyTrip(category: TripCategory = 'domestic'): ManagedTrip {
  return { id: '', category, name_en: '', name_mr: '', thumbnail_path: '', itinerary_en_path: null, itinerary_mr_path: null, published: true, sort_order: 999 }
}

function emptyMemory(): ManagedMemory {
  return { id: '', title_en: '', title_mr: '', video_path: '', published: true, sort_order: 999 }
}

function slugify(value: string) {
  return value.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export function createAdminSeed(trips: { category: TripCategory; items: { id: string; en: string; mr: string; thumbnail: string; english?: string; marathi?: string }[] }[]): SeedTrip[] {
  return trips.flatMap(({ category, items }) => items.map((trip, index) => {
    const staticPath = (path?: string) => path ? `site-assets:assets/${path}` : null
    const base = `${import.meta.env.BASE_URL}assets/`
    const thumbnailPath = trip.thumbnail.startsWith(base) ? `site-assets:assets/${decodeURI(trip.thumbnail.slice(base.length))}` : trip.thumbnail
    return {
      id: trip.id, category, name_en: trip.en, name_mr: trip.mr, thumbnail_path: thumbnailPath,
      itinerary_en_path: staticPath(trip.english), itinerary_mr_path: staticPath(trip.marathi),
      published: true, sort_order: index * 10,
    }
  }))
}

export default function AdminDashboard({ initialTrips, initialMemories }: { initialTrips: SeedTrip[]; initialMemories: ManagedMemory[] }) {
  const [session, setSession] = useState<AuthSession | null>(() => readSession())
  const [rows, setRows] = useState<ManagedTrip[]>([])
  const [memories, setMemories] = useState<ManagedMemory[]>([])
  const [section, setSection] = useState<'trips' | 'memories'>('trips')
  const [form, setForm] = useState<ManagedTrip>(() => emptyTrip())
  const [memoryForm, setMemoryForm] = useState<ManagedMemory>(() => emptyMemory())
  const [thumbFile, setThumbFile] = useState<File | null>(null)
  const [englishFile, setEnglishFile] = useState<File | null>(null)
  const [marathiFile, setMarathiFile] = useState<File | null>(null)
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [query, setQuery] = useState('')

  const reload = async (accessToken: string) => {
    const [trips, videos] = await Promise.all([fetchTrips(accessToken), fetchAdminMemories(accessToken)])
    setRows(trips); setMemories(videos)
  }
  useEffect(() => { if (session) reload(session.access_token).catch(e => setError(e.message)) }, [session])

  const combinedRows = useMemo(() => {
    const merged = new Map(initialTrips.map(trip => [trip.id, trip]))
    for (const trip of rows) merged.set(trip.id, trip)
    return [...merged.values()].filter(trip => `${trip.name_en} ${trip.name_mr} ${trip.category}`.toLowerCase().includes(query.toLowerCase()))
      .sort((a, b) => a.category.localeCompare(b.category) || a.sort_order - b.sort_order || a.name_en.localeCompare(b.name_en))
  }, [initialTrips, rows, query])

  const combinedMemories = useMemo(() => {
    const merged = new Map(initialMemories.map(memory => [memory.id, memory]))
    for (const memory of memories) merged.set(memory.id, memory)
    return [...merged.values()].filter(memory => `${memory.title_en} ${memory.title_mr}`.toLowerCase().includes(query.toLowerCase()))
      .sort((a, b) => a.sort_order - b.sort_order || a.title_en.localeCompare(b.title_en))
  }, [initialMemories, memories, query])

  const startNew = () => { setForm(emptyTrip()); setThumbFile(null); setEnglishFile(null); setMarathiFile(null); setError(''); setNotice('') }
  const startNewMemory = () => { setMemoryForm(emptyMemory()); setVideoFile(null); setError(''); setNotice('') }
  const edit = (trip: ManagedTrip) => { setForm({ ...trip }); setThumbFile(null); setEnglishFile(null); setMarathiFile(null); setError(''); setNotice('') }
  const editMemory = (memory: ManagedMemory) => { setMemoryForm({ ...memory }); setVideoFile(null); setError(''); setNotice('') }
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

  const handleSaveMemory = async (event: FormEvent) => {
    event.preventDefault()
    if (!session) return
    const id = memoryForm.id.trim() || `memory-${slugify(memoryForm.title_en)}`
    if (!id || id === 'memory-') { setError('Add an English title for this video.'); return }
    setBusy(true); setError(''); setNotice('')
    try {
      const video = videoFile ? await uploadFile(videoFile, session.access_token, 'memories') : memoryForm.video_path
      if (!video) throw new Error('Choose an MP4 video.')
      const record: ManagedMemory = { ...memoryForm, id, video_path: video }
      await saveMemory(record, session.access_token)
      if (memoryForm.video_path && videoFile && memoryForm.video_path !== video) await deleteUploadedFile(memoryForm.video_path, session.access_token).catch(() => {})
      await reload(session.access_token)
      setMemoryForm(record); setVideoFile(null)
      setNotice('Travel memory saved. The public Memories page will show it.')
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to save this video.') }
    finally { setBusy(false) }
  }

  const handleDeleteMemory = async (memory: ManagedMemory) => {
    if (!session || !window.confirm(`Remove “${memory.title_en}” from Travel Memories?`)) return
    setBusy(true); setError(''); setNotice('')
    try {
      if (initialMemories.some(item => item.id === memory.id)) {
        await saveMemory({ ...memory, published: false }, session.access_token)
        await reload(session.access_token)
        setNotice('Travel memory hidden from the public gallery.')
      } else {
        await deleteMemory(memory.id, session.access_token)
        await deleteUploadedFile(memory.video_path, session.access_token).catch(() => {})
        setMemories(current => current.filter(item => item.id !== memory.id))
        setNotice('Travel memory removed.')
      }
      if (memoryForm.id === memory.id) startNewMemory()
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to remove this video.') }
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

  return <main className="admin-page admin-workspace"><header className="admin-topbar"><a className="admin-back" href="#/">← Public website</a><div><span className="admin-kicker">Arth Travels · Admin</span><h1>Manage {section === 'trips' ? 'travel' : 'Travel memories'}</h1></div><button className="admin-secondary" onClick={() => { signOut(); setSession(null) }}>Sign out</button></header>
    <nav className="admin-section-tabs" aria-label="Admin sections">
      <button className={section === 'trips' ? 'is-active' : ''} onClick={() => { setSection('trips'); setQuery(''); setError(''); setNotice('') }}>Destinations & MICE</button>
      <button className={section === 'memories' ? 'is-active' : ''} onClick={() => { setSection('memories'); setQuery(''); setError(''); setNotice('') }}>Travel memories</button>
    </nav>
    {section === 'trips' ? <div className="admin-layout"><section className="admin-list"><div className="admin-list__top"><div><span className="admin-kicker">Tour library · lower sort numbers appear first</span><h2>{combinedRows.length} destinations</h2></div><button className="admin-primary" onClick={startNew}>＋ Add destination</button></div>
      <input className="admin-search" type="search" placeholder="Search destinations" value={query} onChange={e => setQuery(e.target.value)} />
      <div className="admin-trip-list">{combinedRows.map(trip => <button className={`admin-trip ${form.id === trip.id ? 'is-selected' : ''}`} key={trip.id} onClick={() => edit(trip)}>
        <img src={getPublicFile(trip.thumbnail_path)} alt="" onError={event => { event.currentTarget.style.visibility = 'hidden' }} /><span><small>{categories.find(c => c.id === trip.category)?.title} {rows.some(row => row.id === trip.id) ? '· Saved' : '· Site default'}</small><strong>{trip.name_en}</strong></span><i className={trip.published ? 'is-published' : ''}>{trip.published ? 'Live' : 'Hidden'}</i>
      </button>)}</div>
    </section>
    <form className="admin-editor" onSubmit={handleSave}><div className="admin-editor__heading"><div><span className="admin-kicker">Trip details</span><h2>{form.id ? 'Edit destination' : 'Add a destination'}</h2></div>{form.id && <button type="button" className="admin-delete" disabled={busy} onClick={() => handleDelete(form)}>Delete / hide</button>}</div>
      <div className="admin-fields admin-fields--two"><label>Category<select value={form.category} onChange={e => update('category', e.target.value as TripCategory)}>{categories.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}</select></label><label>Sort order<input type="number" value={form.sort_order} onChange={e => update('sort_order', Number(e.target.value))} /><small>0 appears first; 10 appears after it. New items default to 999 (near the bottom).</small></label></div>
      <div className="admin-fields admin-fields--two"><label>Name in English<input required value={form.name_en} onChange={e => update('name_en', e.target.value)} /></label><label>Name in Marathi<input value={form.name_mr} onChange={e => update('name_mr', e.target.value)} /></label></div>
      <label className="admin-file">Destination thumbnail<input required={!form.thumbnail_path && !thumbFile} type="file" accept="image/*" onChange={e => setThumbFile(e.target.files?.[0] || null)} /><small>{thumbFile?.name || (form.thumbnail_path ? 'Current image kept unless you choose a replacement.' : 'Choose a JPG, PNG or WebP photo.')}</small></label>
      <div className="admin-fields admin-fields--two"><label className="admin-file">English itinerary poster<input type="file" accept="image/*" onChange={e => setEnglishFile(e.target.files?.[0] || null)} /><small>{englishFile?.name || (form.itinerary_en_path ? 'Current itinerary poster is set.' : 'Optional')}</small></label><label className="admin-file">Marathi itinerary poster<input type="file" accept="image/*" onChange={e => setMarathiFile(e.target.files?.[0] || null)} /><small>{marathiFile?.name || (form.itinerary_mr_path ? 'Current itinerary poster is set.' : 'Optional')}</small></label></div>
      <label className="admin-toggle"><input type="checkbox" checked={form.published} onChange={e => update('published', e.target.checked)} /><span><strong>Show on public website</strong><small>Unpublished destinations stay in this dashboard.</small></span></label>
      {error && <div className="admin-message is-error" role="alert">{error}</div>}{notice && <div className="admin-message" role="status">{notice}</div>}
      <button className="admin-primary admin-save" disabled={busy}>{busy ? 'Saving…' : 'Save destination'}</button>
    </form></div> : <div className="admin-layout"><section className="admin-list"><div className="admin-list__top"><div><span className="admin-kicker">Customer video gallery · lower sort numbers appear first</span><h2>{combinedMemories.length} videos</h2></div><button className="admin-primary" onClick={startNewMemory}>＋ Add video</button></div>
      <input className="admin-search" type="search" placeholder="Search memories" value={query} onChange={e => setQuery(e.target.value)} />
      <div className="admin-trip-list">{combinedMemories.map(memory => <button className={`admin-trip ${memoryForm.id === memory.id ? 'is-selected' : ''}`} key={memory.id} onClick={() => editMemory(memory)}>
        <video src={getPublicFile(memory.video_path)} muted preload="none" /><span><small>{memories.some(item => item.id === memory.id) ? 'Saved' : 'Site default'}</small><strong>{memory.title_en}</strong></span><i className={memory.published ? 'is-published' : ''}>{memory.published ? 'Live' : 'Hidden'}</i>
      </button>)}</div>
    </section>
    <form className="admin-editor" onSubmit={handleSaveMemory}><div className="admin-editor__heading"><div><span className="admin-kicker">Travel memory</span><h2>{memoryForm.id ? 'Edit video' : 'Add a video'}</h2></div>{memoryForm.id && <button type="button" className="admin-delete" disabled={busy} onClick={() => handleDeleteMemory(memoryForm)}>Delete / hide</button>}</div>
      <div className="admin-fields admin-fields--two"><label>Title in English<input required value={memoryForm.title_en} onChange={e => setMemoryForm(current => ({ ...current, title_en: e.target.value }))} /></label><label>Title in Marathi<input value={memoryForm.title_mr} onChange={e => setMemoryForm(current => ({ ...current, title_mr: e.target.value }))} /></label></div>
      <label>Sort order<input type="number" value={memoryForm.sort_order} onChange={e => setMemoryForm(current => ({ ...current, sort_order: Number(e.target.value) }))} /><small>0 appears first; new videos default to the bottom.</small></label>
      <label className="admin-file">MP4 video<input type="file" accept="video/mp4,.mp4" required={!memoryForm.video_path && !videoFile} onChange={e => setVideoFile(e.target.files?.[0] || null)} /><small>{videoFile?.name || (memoryForm.video_path ? 'Current video kept unless you choose a replacement.' : 'MP4 only · up to 50 MB per video. Supabase Free storage is 1 GB total.')}</small></label>
      <label className="admin-toggle"><input type="checkbox" checked={memoryForm.published} onChange={e => setMemoryForm(current => ({ ...current, published: e.target.checked }))} /><span><strong>Show on Travel Memories page</strong><small>Hidden videos stay in this dashboard.</small></span></label>
      {error && <div className="admin-message is-error" role="alert">{error}</div>}{notice && <div className="admin-message" role="status">{notice}</div>}
      <button className="admin-primary admin-save" disabled={busy}>{busy ? 'Saving…' : 'Save video'}</button>
    </form></div>}
  </main>
}
