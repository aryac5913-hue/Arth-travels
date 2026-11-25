// import { useEffect, useMemo, useState, type FormEvent } from 'react'
// import {
//   deleteMemory, deleteTrip, deleteUploadedFile, fetchAdminMemories, fetchTrips, getPublicFile, readSession, saveMemory, saveTrip, signIn, signOut, supabaseReady, uploadFile,
//   type AuthSession, type ManagedMemory, type ManagedTrip, type TripCategory,
// } from './lib/supabase'



// type SeedTrip = ManagedTrip
// const categories: { id: TripCategory; title: string }[] = [
//   { id: 'domestic', title: 'Domestic' }, { id: 'international', title: 'International' }, { id: 'mice', title: 'MICE' }, { id: 'pilgrimage', title: 'Pilgrimage' },
// ]

// function emptyTrip(category: TripCategory = 'domestic'): ManagedTrip {
//   return { id: '', category, name_en: '', name_mr: '', thumbnail_path: '', itinerary_en_path: null, itinerary_mr_path: null, published: true, sort_order: 999 }
// }

// function emptyMemory(): ManagedMemory {
//   return { id: '', title_en: '', title_mr: '', video_path: '', published: true, sort_order: 999 }
// }

// function slugify(value: string) {
//   return value.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
// }

// export function createAdminSeed(trips: { category: TripCategory; items: { id: string; en: string; mr: string; thumbnail: string; english?: string; marathi?: string }[] }[]): SeedTrip[] {
//   return trips.flatMap(({ category, items }) => items.map((trip, index) => {
//     const staticPath = (path?: string) => path ? `site-assets:assets/${path}` : null
//     const base = `${import.meta.env.BASE_URL}assets/`
//     const thumbnailPath = trip.thumbnail.startsWith(base) ? `site-assets:assets/${decodeURI(trip.thumbnail.slice(base.length))}` : trip.thumbnail
//     return {
//       id: trip.id, category, name_en: trip.en, name_mr: trip.mr, thumbnail_path: thumbnailPath,
//       itinerary_en_path: staticPath(trip.english), itinerary_mr_path: staticPath(trip.marathi),
//       published: true, sort_order: index * 10,
//     }
//   }))
// }

// export default function AdminDashboard({ initialTrips, initialMemories }: { initialTrips: SeedTrip[]; initialMemories: ManagedMemory[] }) {
//   const [session, setSession] = useState<AuthSession | null>(() => readSession())
//   const [rows, setRows] = useState<ManagedTrip[]>([])
//   const [memories, setMemories] = useState<ManagedMemory[]>([])
//   const [section, setSection] = useState<'trips' | 'memories'>('trips')
//   const [form, setForm] = useState<ManagedTrip>(() => emptyTrip())
//   const [memoryForm, setMemoryForm] = useState<ManagedMemory>(() => emptyMemory())
//   const [thumbFile, setThumbFile] = useState<File | null>(null)
//   const [englishFile, setEnglishFile] = useState<File | null>(null)
//   const [marathiFile, setMarathiFile] = useState<File | null>(null)
//   const [videoFile, setVideoFile] = useState<File | null>(null)
//   const [email, setEmail] = useState('')
//   const [password, setPassword] = useState('')
//   const [busy, setBusy] = useState(false)
//   const [error, setError] = useState('')
//   const [notice, setNotice] = useState('')
//   const [query, setQuery] = useState('')

//   const reload = async (accessToken: string) => {
//     const [trips, videos] = await Promise.all([fetchTrips(accessToken), fetchAdminMemories(accessToken)])
//     setRows(trips); setMemories(videos)
//   }
//   useEffect(() => { if (session) reload(session.access_token).catch(e => setError(e.message)) }, [session])

//   const combinedRows = useMemo(() => {
//     const merged = new Map(initialTrips.map(trip => [trip.id, trip]))
//     for (const trip of rows) merged.set(trip.id, trip)
//     return [...merged.values()].filter(trip => `${trip.name_en} ${trip.name_mr} ${trip.category}`.toLowerCase().includes(query.toLowerCase()))
//       .sort((a, b) => a.category.localeCompare(b.category) || a.sort_order - b.sort_order || a.name_en.localeCompare(b.name_en))
//   }, [initialTrips, rows, query])

//   const combinedMemories = useMemo(() => {
//     const merged = new Map(initialMemories.map(memory => [memory.id, memory]))
//     for (const memory of memories) merged.set(memory.id, memory)
//     return [...merged.values()].filter(memory => `${memory.title_en} ${memory.title_mr}`.toLowerCase().includes(query.toLowerCase()))
//       .sort((a, b) => a.sort_order - b.sort_order || a.title_en.localeCompare(b.title_en))
//   }, [initialMemories, memories, query])

//   const startNew = () => { setForm(emptyTrip()); setThumbFile(null); setEnglishFile(null); setMarathiFile(null); setError(''); setNotice('') }
//   const startNewMemory = () => { setMemoryForm(emptyMemory()); setVideoFile(null); setError(''); setNotice('') }
//   const edit = (trip: ManagedTrip) => { setForm({ ...trip }); setThumbFile(null); setEnglishFile(null); setMarathiFile(null); setError(''); setNotice('') }
//   const editMemory = (memory: ManagedMemory) => { setMemoryForm({ ...memory }); setVideoFile(null); setError(''); setNotice('') }
//   const update = <K extends keyof ManagedTrip>(key: K, value: ManagedTrip[K]) => setForm(current => ({ ...current, [key]: value }))

//   const handleLogin = async (event: FormEvent) => {
//     event.preventDefault(); setBusy(true); setError('')
//     try { setSession(await signIn(email.trim(), password)) } catch (e) { setError(e instanceof Error ? e.message : 'Unable to sign in.') }
//     finally { setBusy(false) }
//   }

//   const handleSave = async (event: FormEvent) => {
//     event.preventDefault()
//     if (!session) return
//     const tripId = form.id.trim() || slugify(form.name_en)
//     if (!tripId) { setError('Add an English destination name so the trip can get an ID.'); return }
//     setBusy(true); setError(''); setNotice('')
//     try {
//       const thumbnail = thumbFile ? await uploadFile(thumbFile, session.access_token) : form.thumbnail_path
//       if (!thumbnail) throw new Error('Choose a thumbnail photo.')
//       const english = englishFile ? await uploadFile(englishFile, session.access_token) : form.itinerary_en_path
//       const marathi = marathiFile ? await uploadFile(marathiFile, session.access_token) : form.itinerary_mr_path
//       const record: ManagedTrip = { ...form, id: tripId, thumbnail_path: thumbnail, itinerary_en_path: english || null, itinerary_mr_path: marathi || null }
//       await saveTrip(record, session.access_token)
//       await reload(session.access_token)
//       setForm(record); setThumbFile(null); setEnglishFile(null); setMarathiFile(null)
//       setNotice('Trip saved. Changes are now available on the public website.')
//     } catch (e) { setError(e instanceof Error ? e.message : 'Unable to save this trip.') }
//     finally { setBusy(false) }
//   }

//   const handleDelete = async (trip: ManagedTrip) => {
//     if (!session || !window.confirm(`Remove “${trip.name_en}” from the destination list?`)) return
//     setBusy(true); setError(''); setNotice('')
//     try {
//       if (initialTrips.some(item => item.id === trip.id)) {
//         await saveTrip({ ...trip, published: false }, session.access_token)
//         await reload(session.access_token)
//         setNotice('Destination hidden from the public website.')
//       } else {
//         await deleteTrip(trip.id, session.access_token)
//         setRows(current => current.filter(row => row.id !== trip.id))
//         setNotice('Saved destination entry removed.')
//       }
//       if (form.id === trip.id) startNew()
//     } catch (e) { setError(e instanceof Error ? e.message : 'Unable to remove this trip.') }
//     finally { setBusy(false) }
//   }

//   const handleSaveMemory = async (event: FormEvent) => {
//     event.preventDefault()
//     if (!session) return
//     const id = memoryForm.id.trim() || `memory-${slugify(memoryForm.title_en)}`
//     if (!id || id === 'memory-') { setError('Add an English title for this video.'); return }
//     setBusy(true); setError(''); setNotice('')
//     try {
//       const video = videoFile ? await uploadFile(videoFile, session.access_token, 'memories') : memoryForm.video_path
//       if (!video) throw new Error('Choose an MP4 video.')
//       const record: ManagedMemory = { ...memoryForm, id, video_path: video }
//       await saveMemory(record, session.access_token)
//       if (memoryForm.video_path && videoFile && memoryForm.video_path !== video) await deleteUploadedFile(memoryForm.video_path, session.access_token).catch(() => {})
//       await reload(session.access_token)
//       setMemoryForm(record); setVideoFile(null)
//       setNotice('Travel memory saved. The public Memories page will show it.')
//     } catch (e) { setError(e instanceof Error ? e.message : 'Unable to save this video.') }
//     finally { setBusy(false) }
//   }

//   const handleDeleteMemory = async (memory: ManagedMemory) => {
//     if (!session || !window.confirm(`Remove “${memory.title_en}” from Travel Memories?`)) return
//     setBusy(true); setError(''); setNotice('')
//     try {
//       if (initialMemories.some(item => item.id === memory.id)) {
//         await saveMemory({ ...memory, published: false }, session.access_token)
//         await reload(session.access_token)
//         setNotice('Travel memory hidden from the public gallery.')
//       } else {
//         await deleteMemory(memory.id, session.access_token)
//         await deleteUploadedFile(memory.video_path, session.access_token).catch(() => {})
//         setMemories(current => current.filter(item => item.id !== memory.id))
//         setNotice('Travel memory removed.')
//       }
//       if (memoryForm.id === memory.id) startNewMemory()
//     } catch (e) { setError(e instanceof Error ? e.message : 'Unable to remove this video.') }
//     finally { setBusy(false) }
//   }

//   if (!supabaseReady) return <main className="admin-page"><section className="admin-card"><span className="admin-kicker">Arth Travels</span><h1>Admin setup needed</h1><p>Add the Supabase Project URL and publishable key as deployment environment variables, then reload.</p></section></main>
//   if (!session) return <main className="admin-page"><form className="admin-card admin-login" onSubmit={handleLogin}>
//     <a className="admin-back" href="#/">← Back to website</a><span className="admin-kicker">Arth Travels · Private</span><h1>Admin sign in</h1>
//     <p>Use the administrator email and password created in Supabase Authentication.</p>
//     <label>Email<input type="email" autoComplete="username" required value={email} onChange={e => setEmail(e.target.value)} /></label>
//     <label>Password<input type="password" autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)} /></label>
//     {error && <div className="admin-message is-error" role="alert">{error}</div>}
//     <button className="admin-primary" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
//   </form></main>

//   return <main className="admin-page admin-workspace"><header className="admin-topbar"><a className="admin-back" href="#/">← Public website</a><div><span className="admin-kicker">Arth Travels · Admin</span><h1>Manage {section === 'trips' ? 'travel' : 'Travel memories'}</h1></div><button className="admin-secondary" onClick={() => { signOut(); setSession(null) }}>Sign out</button></header>
//     <nav className="admin-section-tabs" aria-label="Admin sections">
//       <button className={section === 'trips' ? 'is-active' : ''} onClick={() => { setSection('trips'); setQuery(''); setError(''); setNotice('') }}>Destinations & MICE</button>
//       <button className={section === 'memories' ? 'is-active' : ''} onClick={() => { setSection('memories'); setQuery(''); setError(''); setNotice('') }}>Travel memories</button>
//     </nav>
//     {section === 'trips' ? <div className="admin-layout"><section className="admin-list"><div className="admin-list__top"><div><span className="admin-kicker">Tour library · lower sort numbers appear first</span><h2>{combinedRows.length} destinations</h2></div><button className="admin-primary" onClick={startNew}>＋ Add destination</button></div>
//       <input className="admin-search" type="search" placeholder="Search destinations" value={query} onChange={e => setQuery(e.target.value)} />
//       <div className="admin-trip-list">{combinedRows.map(trip => <div className="admin-trip-row" key={trip.id}>
//         <button className={`admin-trip ${form.id === trip.id ? 'is-selected' : ''}`} onClick={() => edit(trip)}>
//           <img src={getPublicFile(trip.thumbnail_path)} alt="" onError={event => { event.currentTarget.style.visibility = 'hidden' }} /><span><small>{categories.find(c => c.id === trip.category)?.title} {rows.some(row => row.id === trip.id) ? '· Saved' : '· Site default'}</small><strong>{trip.name_en}</strong></span><i className={trip.published ? 'is-published' : ''}>{trip.published ? 'Live' : 'Hidden'}</i>
//         </button><button type="button" className="admin-row-delete" aria-label={`Delete or hide ${trip.name_en}`} title="Delete or hide" disabled={busy} onClick={() => handleDelete(trip)}>×</button>
//       </div>)}</div>
//     </section>
//     <form className="admin-editor" onSubmit={handleSave}><div className="admin-editor__heading"><div><span className="admin-kicker">Trip details</span><h2>{form.id ? 'Edit destination' : 'Add a destination'}</h2></div>{form.id && <button type="button" className="admin-delete" disabled={busy} onClick={() => handleDelete(form)}>Delete / hide</button>}</div>
//       <div className="admin-fields admin-fields--two"><label>Category<select value={form.category} onChange={e => update('category', e.target.value as TripCategory)}>{categories.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}</select></label><label>Sort order<input type="number" value={form.sort_order} onChange={e => update('sort_order', Number(e.target.value))} /><small>0 appears first; 10 appears after it. New items default to 999 (near the bottom).</small></label></div>
//       <div className="admin-fields admin-fields--two"><label>Name in English<input required value={form.name_en} onChange={e => update('name_en', e.target.value)} /></label><label>Name in Marathi<input value={form.name_mr} onChange={e => update('name_mr', e.target.value)} /></label></div>
//       <label className="admin-file">Destination thumbnail<input required={!form.thumbnail_path && !thumbFile} type="file" accept="image/*" onChange={e => setThumbFile(e.target.files?.[0] || null)} /><small>{thumbFile?.name || (form.thumbnail_path ? 'Current image kept unless you choose a replacement.' : 'Choose a JPG, PNG or WebP photo.')}</small></label>
//       <div className="admin-fields admin-fields--two"><label className="admin-file">English itinerary poster<input type="file" accept="image/*" onChange={e => setEnglishFile(e.target.files?.[0] || null)} /><small>{englishFile?.name || (form.itinerary_en_path ? 'Current itinerary poster is set.' : 'Optional')}</small></label><label className="admin-file">Marathi itinerary poster<input type="file" accept="image/*" onChange={e => setMarathiFile(e.target.files?.[0] || null)} /><small>{marathiFile?.name || (form.itinerary_mr_path ? 'Current itinerary poster is set.' : 'Optional')}</small></label></div>
//       <label className="admin-toggle"><input type="checkbox" checked={form.published} onChange={e => update('published', e.target.checked)} /><span><strong>Show on public website</strong><small>Unpublished destinations stay in this dashboard.</small></span></label>
//       {error && <div className="admin-message is-error" role="alert">{error}</div>}{notice && <div className="admin-message" role="status">{notice}</div>}
//       <button className="admin-primary admin-save" disabled={busy}>{busy ? 'Saving…' : 'Save destination'}</button>
//     </form></div> : <div className="admin-layout"><section className="admin-list"><div className="admin-list__top"><div><span className="admin-kicker">Customer video gallery · lower sort numbers appear first</span><h2>{combinedMemories.length} videos</h2></div><button className="admin-primary" onClick={startNewMemory}>＋ Add video</button></div>
//       <input className="admin-search" type="search" placeholder="Search memories" value={query} onChange={e => setQuery(e.target.value)} />
//       <div className="admin-trip-list">{combinedMemories.map(memory => <div className="admin-trip-row" key={memory.id}>
//         <button className={`admin-trip ${memoryForm.id === memory.id ? 'is-selected' : ''}`} onClick={() => editMemory(memory)}>
//           <video src={getPublicFile(memory.video_path)} muted preload="none" /><span><small>{memories.some(item => item.id === memory.id) ? 'Saved' : 'Site default'}</small><strong>{memory.title_en}</strong></span><i className={memory.published ? 'is-published' : ''}>{memory.published ? 'Live' : 'Hidden'}</i>
//         </button><button type="button" className="admin-row-delete" aria-label={`Delete or hide ${memory.title_en}`} title="Delete or hide" disabled={busy} onClick={() => handleDeleteMemory(memory)}>×</button>
//       </div>)}</div>
//     </section>
//     <form className="admin-editor" onSubmit={handleSaveMemory}><div className="admin-editor__heading"><div><span className="admin-kicker">Travel memory</span><h2>{memoryForm.id ? 'Edit video' : 'Add a video'}</h2></div>{memoryForm.id && <button type="button" className="admin-delete" disabled={busy} onClick={() => handleDeleteMemory(memoryForm)}>Delete / hide</button>}</div>
//       <div className="admin-fields admin-fields--two"><label>Title in English<input required value={memoryForm.title_en} onChange={e => setMemoryForm(current => ({ ...current, title_en: e.target.value }))} /></label><label>Title in Marathi<input value={memoryForm.title_mr} onChange={e => setMemoryForm(current => ({ ...current, title_mr: e.target.value }))} /></label></div>
//       <label>Sort order<input type="number" value={memoryForm.sort_order} onChange={e => setMemoryForm(current => ({ ...current, sort_order: Number(e.target.value) }))} /><small>0 appears first; new videos default to the bottom.</small></label>
//       <label className="admin-file">MP4 video<input type="file" accept="video/mp4,.mp4" required={!memoryForm.video_path && !videoFile} onChange={e => setVideoFile(e.target.files?.[0] || null)} /><small>{videoFile?.name || (memoryForm.video_path ? 'Current video kept unless you choose a replacement.' : 'MP4 only · up to 50 MB per video. Supabase Free storage is 1 GB total.')}</small></label>
//       <label className="admin-toggle"><input type="checkbox" checked={memoryForm.published} onChange={e => setMemoryForm(current => ({ ...current, published: e.target.checked }))} /><span><strong>Show on Travel Memories page</strong><small>Hidden videos stay in this dashboard.</small></span></label>
//       {error && <div className="admin-message is-error" role="alert">{error}</div>}{notice && <div className="admin-message" role="status">{notice}</div>}
//       <button className="admin-primary admin-save" disabled={busy}>{busy ? 'Saving…' : 'Save video'}</button>
//     </form></div>}
//   </main>
// }






import { useEffect, useMemo, useState, type CSSProperties, type FormEvent } from 'react'
import { defaultAbout, type AboutContent, type AboutCopy, type AboutSection, type Language } from './lib/about'
import {
  deleteAboutSection, deleteMemory, deleteTrip, deleteUploadedFile, fetchAboutContent, fetchAdminAboutSections, fetchAdminMemories, fetchTrips, getPublicFile, readSession, saveAboutContent, saveAboutSection, saveMemory, saveTrip, signIn, signOut, supabaseReady, uploadFile,
  type AuthSession, type ManagedMemory, type ManagedTrip, type TripCategory,
} from './lib/supabase'

type SeedTrip = ManagedTrip
type PhotoSlot = keyof AboutContent['photos']

const categories: { id: TripCategory; title: string }[] = [
  { id: 'domestic', title: 'Domestic' }, { id: 'international', title: 'International' }, { id: 'mice', title: 'MICE' }, { id: 'pilgrimage', title: 'Pilgrimage' },
]

const photoSlots: { key: PhotoSlot; title: string; hint: string }[] = [
  { key: 'main', title: '1. Main Founder Photo', hint: 'Shown next to the founder bio.' },
  { key: 'second', title: '2. Session / Group Photo', hint: 'Shown in the story gallery.' },
  { key: 'third', title: '3. Event / Recognition Photo', hint: 'Shown as the third About image.' },
]

const cardBoxStyle: CSSProperties = {
  border: '1px solid rgba(25, 45, 35, 0.14)',
  borderRadius: '14px',
  padding: '18px',
  marginBottom: '18px',
  background: '#fff',
}

const inputBoxStyle: CSSProperties = {
  width: '100%',
  marginTop: '6px',
  padding: '10px 12px',
  borderRadius: '10px',
  border: '1px solid rgba(25, 45, 35, 0.22)',
  background: '#fcfbf8',
  font: 'inherit',
  color: 'inherit',
}

function isVideoPath(path: string) {
  return /\.(mp4|webm|mov)(\?|$)/i.test(path)
}

function emptyCustomSection(): AboutSection {
  return {
    id: '',
    type: 'testimonial',
    title_en: '',
    title_mr: '',
    body_en: '',
    body_mr: '',
    author_en: '',
    author_mr: '',
    image_path: '',
    sort_order: 100,
    published: true,
  }
}

function mergeAbout(source?: AboutContent | null): AboutContent {
  return {
    id: 'main',
    en: {
      ...defaultAbout.en,
      ...source?.en,
      historyPoints: (source?.en?.historyPoints ?? defaultAbout.en.historyPoints).map(item => ({ ...item })),
    },
    mr: {
      ...defaultAbout.mr,
      ...source?.mr,
      historyPoints: (source?.mr?.historyPoints ?? defaultAbout.mr.historyPoints).map(item => ({ ...item })),
    },
    photos: {
      ...defaultAbout.photos,
      ...source?.photos,
    },
  }
}

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
  const [about, setAbout] = useState<AboutContent>(() => mergeAbout())
  const [aboutSections, setAboutSections] = useState<AboutSection[]>([])
  const [sectionForm, setSectionForm] = useState<AboutSection>(() => emptyCustomSection())
  const [sectionMediaFile, setSectionMediaFile] = useState<File | null>(null)
  const [aboutLang, setAboutLang] = useState<Language>('en')
  const [aboutFiles, setAboutFiles] = useState<Partial<Record<PhotoSlot, File>>>({})
  const [section, setSection] = useState<'trips' | 'memories' | 'about' | 'testimonials'>('trips')
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
    const [trips, videos, aboutData, customSections] = await Promise.all([
      fetchTrips(accessToken),
      fetchAdminMemories(accessToken),
      fetchAboutContent().catch(() => null),
      fetchAdminAboutSections(accessToken).catch(() => []),
    ])
    setRows(trips)
    setMemories(videos)
    setAbout(mergeAbout(aboutData))
    setAboutSections(customSections)
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

  const filteredSections = useMemo(() => {
    return aboutSections
      .filter(item => `${item.title_en} ${item.title_mr} ${item.author_en} ${item.author_mr} ${item.type}`.toLowerCase().includes(query.toLowerCase()))
      .sort((a, b) => a.sort_order - b.sort_order || a.title_en.localeCompare(b.title_en))
  }, [aboutSections, query])

  const startNew = () => { setForm(emptyTrip()); setThumbFile(null); setEnglishFile(null); setMarathiFile(null); setError(''); setNotice('') }
  const startNewMemory = () => { setMemoryForm(emptyMemory()); setVideoFile(null); setError(''); setNotice('') }
  const startNewCustomSection = () => { setSectionForm(emptyCustomSection()); setSectionMediaFile(null); setError(''); setNotice('') }
  const edit = (trip: ManagedTrip) => { setForm({ ...trip }); setThumbFile(null); setEnglishFile(null); setMarathiFile(null); setError(''); setNotice('') }
  const editMemory = (memory: ManagedMemory) => { setMemoryForm({ ...memory }); setVideoFile(null); setError(''); setNotice('') }
  const editCustomSection = (item: AboutSection) => { setSectionForm({ ...item }); setSectionMediaFile(null); setError(''); setNotice('') }
  const update = <K extends keyof ManagedTrip>(key: K, value: ManagedTrip[K]) => setForm(current => ({ ...current, [key]: value }))

  const updateAboutCopy = <K extends keyof Omit<AboutCopy, 'historyPoints'>>(key: K, value: AboutCopy[K]) => {
    setAbout(current => ({
      ...current,
      [aboutLang]: { ...current[aboutLang], [key]: value },
    }))
  }

  const updateHistoryPoint = (index: number, field: 'place' | 'detail', value: string) => {
    setAbout(current => ({
      ...current,
      [aboutLang]: {
        ...current[aboutLang],
        historyPoints: current[aboutLang].historyPoints.map((pt, i) => i === index ? { ...pt, [field]: value } : pt),
      },
    }))
  }

  const addHistoryPoint = () => {
    setAbout(current => ({
      ...current,
      [aboutLang]: {
        ...current[aboutLang],
        historyPoints: [...current[aboutLang].historyPoints, { place: '', detail: '' }],
      },
    }))
  }

  const removeHistoryPoint = (index: number) => {
    if (!window.confirm('Delete this history highlight?')) return
    setAbout(current => ({
      ...current,
      [aboutLang]: {
        ...current[aboutLang],
        historyPoints: current[aboutLang].historyPoints.filter((_, i) => i !== index),
      },
    }))
  }

  const resetPhotoSlot = (slot: PhotoSlot) => {
    setAboutFiles(prev => {
      const next = { ...prev }
      delete next[slot]
      return next
    })
    setAbout(current => ({
      ...current,
      photos: { ...current.photos, [slot]: defaultAbout.photos[slot] },
    }))
    setNotice('Photo reset to original default. Click "Save About section" to apply.')
  }

  const handleResetAllAbout = async () => {
    const currentSession = readSession() || session
    if (!currentSession || !window.confirm('Reset ALL About text (English & Marathi) and photos back to the original website defaults?')) return
    setBusy(true); setError(''); setNotice('')
    try {
      const oldPhotos = Object.values(about.photos)
      const fresh = mergeAbout(defaultAbout)
      await saveAboutContent(fresh, currentSession.access_token)
      for (const path of oldPhotos) {
        await deleteUploadedFile(path, currentSession.access_token).catch(() => {})
      }
      setAbout(fresh)
      setAboutFiles({})
      setNotice('About section reset to original website content.')
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to reset About section.') }
    finally { setBusy(false) }
  }

  const handleSaveAbout = async (event: FormEvent) => {
    event.preventDefault()
    const currentSession = readSession() || session
    if (!currentSession) return
    setBusy(true); setError(''); setNotice('')
    try {
      const nextPhotos = { ...about.photos }
      const replacedPaths: string[] = []
      for (const slot of photoSlots) {
        const file = aboutFiles[slot.key]
        if (file) {
          const uploaded = await uploadFile(file, currentSession.access_token, 'about')
          if (about.photos[slot.key] && about.photos[slot.key] !== uploaded) {
            replacedPaths.push(about.photos[slot.key])
          }
          nextPhotos[slot.key] = uploaded
        }
      }
      const payload: AboutContent = { ...about, id: 'main', photos: nextPhotos }
      await saveAboutContent(payload, currentSession.access_token)
      const latestSession = readSession() || currentSession
      setSession(latestSession)
      for (const oldPath of replacedPaths) {
        await deleteUploadedFile(oldPath, latestSession.access_token).catch(() => {})
      }
      setAbout(mergeAbout(payload))
      setAboutFiles({})
      setNotice('About section saved! Refresh www.arthtravels.com to view changes.')
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to save About section.') }
    finally { setBusy(false) }
  }

  const handleSaveCustomSection = async (event: FormEvent) => {
    event.preventDefault()
    const currentSession = readSession() || session
    if (!currentSession) return
    const id = sectionForm.id.trim() || `sec-${slugify(sectionForm.title_en || sectionForm.author_en || 'item')}-${Date.now().toString(36)}`
    if (!sectionForm.title_en.trim() && !sectionForm.body_en.trim()) {
      setError('Please enter at least an English heading or description.')
      return
    }
    setBusy(true); setError(''); setNotice('')
    try {
      const mediaPath = sectionMediaFile
        ? await uploadFile(sectionMediaFile, currentSession.access_token, 'about-sections')
        : sectionForm.image_path

      const record: AboutSection = { ...sectionForm, id, image_path: mediaPath || '' }
      await saveAboutSection(record, currentSession.access_token)

      const latestSession = readSession() || currentSession
      setSession(latestSession)
      if (sectionForm.image_path && sectionMediaFile && sectionForm.image_path !== mediaPath) {
        await deleteUploadedFile(sectionForm.image_path, latestSession.access_token).catch(() => {})
      }
      await reload(latestSession.access_token)
      setSectionForm(record)
      setSectionMediaFile(null)
      setNotice('Saved! It will now appear on www.arthtravels.com.')
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to save.') }
    finally { setBusy(false) }
  }

  const handleDeleteCustomSection = async (item: AboutSection) => {
    const currentSession = readSession() || session
    if (!currentSession || !window.confirm(`Delete "${item.title_en || item.author_en || 'this item'}" permanently?`)) return
    setBusy(true); setError(''); setNotice('')
    try {
      await deleteAboutSection(item.id, currentSession.access_token)
      if (item.image_path) {
        await deleteUploadedFile(item.image_path, currentSession.access_token).catch(() => {})
      }
      setAboutSections(prev => prev.filter(s => s.id !== item.id))
      if (sectionForm.id === item.id) startNewCustomSection()
      setNotice('Deleted successfully.')
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to delete.') }
    finally { setBusy(false) }
  }

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

  const headingTitle =
    section === 'trips'
      ? 'travel'
      : section === 'memories'
      ? 'Travel memories'
      : section === 'about'
      ? 'About section'
      : 'Testimonials & Sections'
  const activeCopy = about[aboutLang]

  return <main className="admin-page admin-workspace"><header className="admin-topbar"><a className="admin-back" href="#/">← Public website</a><div><span className="admin-kicker">Arth Travels · Admin</span><h1>Manage {headingTitle}</h1></div><button className="admin-secondary" onClick={() => { signOut(); setSession(null) }}>Sign out</button></header>
    <nav className="admin-section-tabs" aria-label="Admin sections">
      <button className={section === 'trips' ? 'is-active' : ''} onClick={() => { setSection('trips'); setQuery(''); setError(''); setNotice('') }}>Destinations & MICE</button>
      <button className={section === 'memories' ? 'is-active' : ''} onClick={() => { setSection('memories'); setQuery(''); setError(''); setNotice('') }}>Travel memories</button>
      <button className={section === 'about' ? 'is-active' : ''} onClick={() => { setSection('about'); setQuery(''); setError(''); setNotice('') }}>About section</button>
      <button className={section === 'testimonials' ? 'is-active' : ''} onClick={() => { setSection('testimonials'); setQuery(''); setError(''); setNotice('') }}>Testimonials</button>
    </nav>
    {section === 'trips' ? <div className="admin-layout"><section className="admin-list"><div className="admin-list__top"><div><span className="admin-kicker">Tour library · lower sort numbers appear first</span><h2>{combinedRows.length} destinations</h2></div><button className="admin-primary" onClick={startNew}>＋ Add destination</button></div>
      <input className="admin-search" type="search" placeholder="Search destinations" value={query} onChange={e => setQuery(e.target.value)} />
      <div className="admin-trip-list">{combinedRows.map(trip => <div className="admin-trip-row" key={trip.id}>
        <button className={`admin-trip ${form.id === trip.id ? 'is-selected' : ''}`} onClick={() => edit(trip)}>
          <img src={getPublicFile(trip.thumbnail_path)} alt="" onError={event => { event.currentTarget.style.visibility = 'hidden' }} /><span><small>{categories.find(c => c.id === trip.category)?.title} {rows.some(row => row.id === trip.id) ? '· Saved' : '· Site default'}</small><strong>{trip.name_en}</strong></span><i className={trip.published ? 'is-published' : ''}>{trip.published ? 'Live' : 'Hidden'}</i>
        </button><button type="button" className="admin-row-delete" aria-label={`Delete or hide ${trip.name_en}`} title="Delete or hide" disabled={busy} onClick={() => handleDelete(trip)}>×</button>
      </div>)}</div>
    </section>
    <form className="admin-editor" onSubmit={handleSave}><div className="admin-editor__heading"><div><span className="admin-kicker">Trip details</span><h2>{form.id ? 'Edit destination' : 'Add a destination'}</h2></div>{form.id && <button type="button" className="admin-delete" disabled={busy} onClick={() => handleDelete(form)}>Delete / hide</button>}</div>
      <div className="admin-fields admin-fields--two"><label>Category<select value={form.category} onChange={e => update('category', e.target.value as TripCategory)}>{categories.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}</select></label><label>Sort order<input type="number" value={form.sort_order} onChange={e => update('sort_order', Number(e.target.value))} /><small>0 appears first; 10 appears after it. New items default to 999 (near the bottom).</small></label></div>
      <div className="admin-fields admin-fields--two"><label>Name in English<input required value={form.name_en} onChange={e => update('name_en', e.target.value)} /></label><label>Name in Marathi<input value={form.name_mr} onChange={e => update('name_mr', e.target.value)} /></label></div>
      <label className="admin-file">Destination thumbnail<input required={!form.thumbnail_path && !thumbFile} type="file" accept="image/*" onChange={e => setThumbFile(e.target.files?.[0] || null)} /><small>{thumbFile?.name || (form.thumbnail_path ? 'Current image kept unless you choose a replacement.' : 'Choose a JPG, PNG or WebP photo.')}</small></label>
      <div className="admin-fields admin-fields--two"><label className="admin-file">English itinerary poster<input type="file" accept="image/*" onChange={e => setEnglishFile(e.target.files?.[0] || null)} /><small>{englishFile?.name || (form.itinerary_en_path ? 'Current itinerary poster is set.' : 'Optional')}</small></label><label className="admin-file">Marathi itinerary poster<input type="file" accept="image/*" onChange={e => setMarathiFile(e.target.files?.[0] || null)} /><small>{marathiFile?.name || (form.itinerary_mr_path ? 'Current itinerary poster is set.' : 'Optional')}</small></label></div>
      <label className="admin-toggle"><input type="checkbox" checked={form.published} onChange={e => update('published', e.target.checked)} /><span><strong>Show on public website</strong><small>Unpublished destinations stay in this dashboard.</small></span></label>
      {error && <div className="admin-message is-error" role="alert">{error}</div>}{notice && <div className="admin-message" role="status">{notice}</div>}
      <button className="admin-primary admin-save" disabled={busy}>{busy ? 'Saving…' : 'Save destination'}</button>
    </form></div> : section === 'memories' ? <div className="admin-layout"><section className="admin-list"><div className="admin-list__top"><div><span className="admin-kicker">Customer video gallery · lower sort numbers appear first</span><h2>{combinedMemories.length} videos</h2></div><button className="admin-primary" onClick={startNewMemory}>＋ Add video</button></div>
      <input className="admin-search" type="search" placeholder="Search memories" value={query} onChange={e => setQuery(e.target.value)} />
      <div className="admin-trip-list">{combinedMemories.map(memory => <div className="admin-trip-row" key={memory.id}>
        <button className={`admin-trip ${memoryForm.id === memory.id ? 'is-selected' : ''}`} onClick={() => editMemory(memory)}>
          <video src={getPublicFile(memory.video_path)} muted preload="none" /><span><small>{memories.some(item => item.id === memory.id) ? 'Saved' : 'Site default'}</small><strong>{memory.title_en}</strong></span><i className={memory.published ? 'is-published' : ''}>{memory.published ? 'Live' : 'Hidden'}</i>
        </button><button type="button" className="admin-row-delete" aria-label={`Delete or hide ${memory.title_en}`} title="Delete or hide" disabled={busy} onClick={() => handleDeleteMemory(memory)}>×</button>
      </div>)}</div>
    </section>
    <form className="admin-editor" onSubmit={handleSaveMemory}><div className="admin-editor__heading"><div><span className="admin-kicker">Travel memory</span><h2>{memoryForm.id ? 'Edit video' : 'Add a video'}</h2></div>{memoryForm.id && <button type="button" className="admin-delete" disabled={busy} onClick={() => handleDeleteMemory(memoryForm)}>Delete / hide</button>}</div>
      <div className="admin-fields admin-fields--two"><label>Title in English<input required value={memoryForm.title_en} onChange={e => setMemoryForm(current => ({ ...current, title_en: e.target.value }))} /></label><label>Title in Marathi<input value={memoryForm.title_mr} onChange={e => setMemoryForm(current => ({ ...current, title_mr: e.target.value }))} /></label></div>
      <label>Sort order<input type="number" value={memoryForm.sort_order} onChange={e => setMemoryForm(current => ({ ...current, sort_order: Number(e.target.value) }))} /><small>0 appears first; new videos default to the bottom.</small></label>
      <label className="admin-file">MP4 video<input type="file" accept="video/mp4,.mp4" required={!memoryForm.video_path && !videoFile} onChange={e => setVideoFile(e.target.files?.[0] || null)} /><small>{videoFile?.name || (memoryForm.video_path ? 'Current video kept unless you choose a replacement.' : 'MP4 only · up to 50 MB per video. Supabase Free storage is 1 GB total.')}</small></label>
      <label className="admin-toggle"><input type="checkbox" checked={memoryForm.published} onChange={e => setMemoryForm(current => ({ ...current, published: e.target.checked }))} /><span><strong>Show on Travel Memories page</strong><small>Hidden videos stay in this dashboard.</small></span></label>
      {error && <div className="admin-message is-error" role="alert">{error}</div>}{notice && <div className="admin-message" role="status">{notice}</div>}
      <button className="admin-primary admin-save" disabled={busy}>{busy ? 'Saving…' : 'Save video'}</button>
    </form></div> : section === 'about' ? <form className="admin-editor" onSubmit={handleSaveAbout} style={{ maxWidth: '980px', margin: '0 auto' }}>
      <div className="admin-editor__heading">
        <div>
          <span className="admin-kicker">Edit live website content</span>
          <h2>About Page ({aboutLang === 'en' ? 'English' : 'Marathi'})</h2>
          <small>Edit text in both English and Marathi tabs below, then click Save at the bottom.</small>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="admin-section-tabs" aria-label="About language" style={{ margin: 0 }}>
            <button type="button" className={aboutLang === 'en' ? 'is-active' : ''} onClick={() => setAboutLang('en')}>English</button>
            <button type="button" className={aboutLang === 'mr' ? 'is-active' : ''} onClick={() => setAboutLang('mr')}>मराठी (Marathi)</button>
          </div>
          <button type="button" className="admin-delete" disabled={busy} onClick={handleResetAllAbout}>Reset all to default</button>
        </div>
      </div>

      <section style={cardBoxStyle}>
        <span className="admin-kicker">Step 1 · Founder profile</span>
        <h3 style={{ margin: '4px 0 14px' }}>Founder details</h3>
        <div className="admin-fields admin-fields--two">
          <label>Small label above name<input style={inputBoxStyle} value={activeCopy.founderKicker} onChange={e => updateAboutCopy('founderKicker', e.target.value)} /></label>
          <label>Founder name<input style={inputBoxStyle} value={activeCopy.founderName} onChange={e => updateAboutCopy('founderName', e.target.value)} /></label>
        </div>
        <label style={{ display: 'block', marginTop: '12px' }}>Founder role / title<input style={inputBoxStyle} value={activeCopy.founderRole} onChange={e => updateAboutCopy('founderRole', e.target.value)} /></label>
        <label style={{ display: 'block', marginTop: '12px' }}>Founder introduction paragraph<textarea style={inputBoxStyle} rows={4} value={activeCopy.founderBio} onChange={e => updateAboutCopy('founderBio', e.target.value)} /></label>
      </section>

      <section style={cardBoxStyle}>
        <span className="admin-kicker">Step 2 · Story section</span>
        <h3 style={{ margin: '4px 0 14px' }}>Main story heading & intro</h3>
        <div className="admin-fields admin-fields--two">
          <label>Section label<input style={inputBoxStyle} value={activeCopy.storyKicker} onChange={e => updateAboutCopy('storyKicker', e.target.value)} /></label>
          <label>Main heading<input style={inputBoxStyle} value={activeCopy.storyTitle} onChange={e => updateAboutCopy('storyTitle', e.target.value)} /></label>
        </div>
        <label style={{ display: 'block', marginTop: '12px' }}>Introduction text<textarea style={inputBoxStyle} rows={3} value={activeCopy.storyText} onChange={e => updateAboutCopy('storyText', e.target.value)} /></label>
      </section>

      <section style={cardBoxStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', gap: '12px', flexWrap: 'wrap' }}>
          <div>
            <span className="admin-kicker">Step 3 · Destination stories</span>
            <h3 style={{ margin: '4px 0 0' }}>History highlights ({activeCopy.historyPoints.length})</h3>
          </div>
          <button type="button" className="admin-secondary" onClick={addHistoryPoint}>＋ Add new place</button>
        </div>
        <div style={{ display: 'grid', gap: '12px' }}>
          {activeCopy.historyPoints.map((point, index) => (
            <div key={index} style={{ padding: '14px', borderRadius: '10px', background: '#f8f6f1', border: '1px solid rgba(25, 45, 35, 0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <strong>#{index + 1} · {point.place || 'New place'}</strong>
                <button type="button" className="admin-delete" onClick={() => removeHistoryPoint(index)}>Delete</button>
              </div>
              <div className="admin-fields admin-fields--two">
                <label>Place name<input style={inputBoxStyle} value={point.place} onChange={e => updateHistoryPoint(index, 'place', e.target.value)} /></label>
                <label>Story / description<textarea style={inputBoxStyle} rows={2} value={point.detail} onChange={e => updateHistoryPoint(index, 'detail', e.target.value)} /></label>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section style={cardBoxStyle}>
        <span className="admin-kicker">Step 4 · About photos (shared across English & Marathi)</span>
        <h3 style={{ margin: '4px 0 14px' }}>Photos</h3>
        <div className="admin-fields admin-fields--two">
          {photoSlots.map(slot => {
            const selectedFile = aboutFiles[slot.key]
            const previewUrl = selectedFile ? URL.createObjectURL(selectedFile) : getPublicFile(about.photos[slot.key])
            const isDefaultPhoto = about.photos[slot.key] === defaultAbout.photos[slot.key] && !selectedFile
            return (
              <div key={slot.key} style={{ padding: '14px', borderRadius: '10px', background: '#f8f6f1', border: '1px solid rgba(25, 45, 35, 0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                  <strong>{slot.title}</strong>
                  {!isDefaultPhoto && <button type="button" className="admin-delete" onClick={() => resetPhotoSlot(slot.key)}>Reset photo</button>}
                </div>
                <small style={{ display: 'block', opacity: 0.75, marginBottom: '8px' }}>{slot.hint}</small>
                <img src={previewUrl} alt={slot.title} style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '8px', display: 'block', marginBottom: '10px', background: '#eae6dc' }} onError={e => { e.currentTarget.style.visibility = 'hidden' }} />
                <input type="file" accept="image/*" onChange={e => {
                  const file = e.target.files?.[0]
                  setAboutFiles(prev => { const next = { ...prev }; if (file) next[slot.key] = file; else delete next[slot.key]; return next })
                }} />
                <small style={{ display: 'block', marginTop: '6px' }}>{selectedFile ? `Ready: ${selectedFile.name}` : 'Choose a new JPG/PNG/WebP image.'}</small>
              </div>
            )
          })}
        </div>
      </section>

      {error && <div className="admin-message is-error" role="alert">{error}</div>}
      {notice && <div className="admin-message" role="status">{notice}</div>}
      <button className="admin-primary admin-save" disabled={busy}>{busy ? 'Saving…' : 'Save About section'}</button>
    </form> : <div className="admin-layout">
      <section className="admin-list">
        <div className="admin-list__top">
          <div>
            <span className="admin-kicker">Lower sort numbers appear first</span>
            <h2>{filteredSections.length} testimonials & sections</h2>
          </div>
          <button type="button" className="admin-primary" onClick={startNewCustomSection}>＋ Add new</button>
        </div>
        <input className="admin-search" type="search" placeholder="Search testimonials or sections" value={query} onChange={e => setQuery(e.target.value)} />
        <div className="admin-trip-list">
          {filteredSections.length === 0 && <p style={{ padding: '12px', opacity: 0.75 }}>No items yet. Click “＋ Add new” to create a testimonial or section.</p>}
          {filteredSections.map(item => (
            <div className="admin-trip-row" key={item.id}>
              <button type="button" className={`admin-trip ${sectionForm.id === item.id ? 'is-selected' : ''}`} onClick={() => editCustomSection(item)}>
                {item.image_path ? (
                  isVideoPath(item.image_path)
                    ? <video src={getPublicFile(item.image_path)} muted preload="none" />
                    : <img src={getPublicFile(item.image_path)} alt="" />
                ) : null}
                <span>
                  <small>{item.type === 'testimonial' ? 'Testimonial' : 'Section'} · Order {item.sort_order}</small>
                  <strong>{item.title_en || item.author_en || 'Untitled'}</strong>
                </span>
                <i className={item.published ? 'is-published' : ''}>{item.published ? 'Live' : 'Hidden'}</i>
              </button>
              <button type="button" className="admin-row-delete" title="Delete permanently" disabled={busy} onClick={() => handleDeleteCustomSection(item)}>×</button>
            </div>
          ))}
        </div>
      </section>

      <form className="admin-editor" onSubmit={handleSaveCustomSection}>
        <div className="admin-editor__heading">
          <div>
            <span className="admin-kicker">Public website block</span>
            <h2>{sectionForm.id ? 'Edit testimonial / section' : 'Add testimonial / section'}</h2>
          </div>
          {sectionForm.id && (
            <button type="button" className="admin-delete" disabled={busy} onClick={() => handleDeleteCustomSection(sectionForm)}>Delete</button>
          )}
        </div>

        <div className="admin-fields admin-fields--two">
          <label>Type
            <select style={inputBoxStyle} value={sectionForm.type} onChange={e => setSectionForm(prev => ({ ...prev, type: e.target.value as 'text' | 'testimonial' }))}>
              <option value="testimonial">Testimonial (Photo / Video + Review)</option>
              <option value="text">Custom Section (Photo / Video + Info)</option>
            </select>
          </label>
          <label>Sort order
            <input style={inputBoxStyle} type="number" value={sectionForm.sort_order} onChange={e => setSectionForm(prev => ({ ...prev, sort_order: Number(e.target.value) }))} />
          </label>
        </div>

        <div className="admin-fields admin-fields--two">
          <label>Heading (English)<input style={inputBoxStyle} placeholder="e.g. Memorable Kerala Family Trip" value={sectionForm.title_en} onChange={e => setSectionForm(prev => ({ ...prev, title_en: e.target.value }))} /></label>
          <label>Heading (Marathi)<input style={inputBoxStyle} placeholder="मराठी शीर्षक" value={sectionForm.title_mr} onChange={e => setSectionForm(prev => ({ ...prev, title_mr: e.target.value }))} /></label>
        </div>

        <div className="admin-fields admin-fields--two">
          <label>{sectionForm.type === 'testimonial' ? 'Review / Quote (English)' : 'Description (English)'}
            <textarea style={inputBoxStyle} rows={3} value={sectionForm.body_en} onChange={e => setSectionForm(prev => ({ ...prev, body_en: e.target.value }))} />
          </label>
          <label>{sectionForm.type === 'testimonial' ? 'Review / Quote (Marathi)' : 'Description (Marathi)'}
            <textarea style={inputBoxStyle} rows={3} value={sectionForm.body_mr} onChange={e => setSectionForm(prev => ({ ...prev, body_mr: e.target.value }))} />
          </label>
        </div>

        <div className="admin-fields admin-fields--two">
          <label>{sectionForm.type === 'testimonial' ? 'Customer Name & City (English)' : 'Subtitle (English)'}
            <input style={inputBoxStyle} value={sectionForm.author_en} onChange={e => setSectionForm(prev => ({ ...prev, author_en: e.target.value }))} />
          </label>
          <label>{sectionForm.type === 'testimonial' ? 'Customer Name & City (Marathi)' : 'Subtitle (Marathi)'}
            <input style={inputBoxStyle} value={sectionForm.author_mr} onChange={e => setSectionForm(prev => ({ ...prev, author_mr: e.target.value }))} />
          </label>
        </div>

        <label className="admin-file">Photo or MP4 Video (Optional)
          {sectionForm.image_path && !sectionMediaFile && (
            isVideoPath(sectionForm.image_path)
              ? <video src={getPublicFile(sectionForm.image_path)} controls style={{ width: '100%', maxHeight: '180px', borderRadius: '8px', margin: '8px 0' }} />
              : <img src={getPublicFile(sectionForm.image_path)} alt="" style={{ width: '100%', maxHeight: '180px', objectFit: 'cover', borderRadius: '8px', margin: '8px 0' }} />
          )}
          <input type="file" accept="image/*,video/mp4,.mp4" onChange={e => setSectionMediaFile(e.target.files?.[0] || null)} />
          <small>{sectionMediaFile ? `Selected: ${sectionMediaFile.name}` : 'Upload a photo (JPG/PNG/WebP) or video (MP4 up to 50 MB).'}</small>
        </label>

        <label className="admin-toggle">
          <input type="checkbox" checked={sectionForm.published} onChange={e => setSectionForm(prev => ({ ...prev, published: e.target.checked }))} />
          <span><strong>Show on public website (www.arthtravels.com)</strong><small>Uncheck to hide without deleting.</small></span>
        </label>

        {error && <div className="admin-message is-error" role="alert">{error}</div>}
        {notice && <div className="admin-message" role="status">{notice}</div>}
        <button className="admin-primary admin-save" disabled={busy}>{busy ? 'Saving…' : 'Save testimonial / section'}</button>
      </form>
    </div>}
  </main>
}