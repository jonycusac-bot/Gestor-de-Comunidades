import React, { useEffect, useState } from 'react';
import { TestEmail } from './test-email';
import { CommunityModel } from '../data/communitiesData';

type Attachment = { name: string; blob: Blob };
type Meeting = { id: string; communityId: string; title: string; date: string; time: string; place: string; status: 'upcoming' | 'completed'; invitation?: Attachment; minutes?: Attachment };

async function meetingStore(communityId: string, entry?: Meeting): Promise<Meeting[]> {
  const db = await new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open('fincaflow-meetings-demo', 1);
    request.onupgradeneeded = () => request.result.createObjectStore('meetings', { keyPath: 'id' }).createIndex('communityId', 'communityId');
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error('Cierra otras pestañas y vuelve a intentarlo.'));
  });
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('meetings', entry ? 'readwrite' : 'readonly');
    const store = transaction.objectStore('meetings');
    if (entry) store.put(entry);
    const request = store.index('communityId').getAll(communityId);
    transaction.oncomplete = () => { db.close(); resolve(request.result); };
    transaction.onabort = () => { db.close(); reject(transaction.error); };
  });
}

async function readPDF(value: FormDataEntryValue | null): Promise<Attachment> {
  if (!(value instanceof File) || !value.size) throw new Error('Selecciona un PDF con contenido.');
  if (!value.name.toLowerCase().endsWith('.pdf')) throw new Error('Solo se admiten archivos PDF.');
  if (value.size > 10 * 1024 * 1024) throw new Error('El PDF debe ocupar como máximo 10 MB.');
  if (await value.slice(0, 5).text() !== '%PDF-') throw new Error('El archivo no tiene una cabecera PDF válida.');
  return { name: value.name, blob: value.slice(0, value.size, 'application/pdf') };
}

function MeetingPDF({ file, label }: { file: Attachment; label: string }) {
  const [url, setUrl] = useState('');
  useEffect(() => {
    const next = URL.createObjectURL(file.blob); setUrl(next);
    return () => URL.revokeObjectURL(next);
  }, [file.blob]);
  return <div className="meeting-file"><strong>{label}</strong><span>{file.name}</span><a href={url || undefined} target="_blank" rel="noopener noreferrer">Abrir PDF</a><a href={url || undefined} download={file.name}>Descargar</a></div>;
}

export function CommunityMeetings({ community }: { community: CommunityModel; key?: string }) {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [tab, setTab] = useState<'upcoming' | 'completed'>('upcoming');
  const [formStatus, setFormStatus] = useState<'upcoming' | 'completed'>('upcoming');
  const [showForm, setShowForm] = useState(false);
  const [completing, setCompleting] = useState<Meeting | null>(null);
  const [emailMeeting, setEmailMeeting] = useState<Meeting | null>(null);
  const [editing, setEditing] = useState<Meeting | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  useEffect(() => {
    let alive = true;
    meetingStore(community.id).then(result => { if (alive) setMeetings(result); }).catch(() => { if (alive) setError('No se pudieron cargar las juntas de este navegador.'); }).finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [community.id]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || loading) return;
    const data = new FormData(event.currentTarget);
    setBusy(true); setError(''); setMessage('');
    try {
      const value = data.get('pdf');
      const file = editing && (!(value instanceof File) || !value.name) ? undefined : await readPDF(value);
      const invitationValue = data.get('invitation');
      const invitation = editing && invitationValue instanceof File && invitationValue.name ? await readPDF(invitationValue) : undefined;
      const status = editing?.status || (completing ? 'completed' : formStatus);
      const title = String(data.get('title') || '').trim();
      const date = String(data.get('date') || '');
      if (!title) throw new Error('Escribe el título de la junta.');
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || new Date(`${date}T12:00:00Z`).toISOString().slice(0, 10) !== date) throw new Error('Indica una fecha válida.');
      const entry: Meeting = { ...(editing || completing || {}), id: editing?.id || completing?.id || crypto.randomUUID(), communityId: community.id, title, date, time: String(data.get('time') || ''), place: String(data.get('place') || '').trim(), status, ...(file ? (status === 'upcoming' ? { invitation: file } : { minutes: file }) : {}), ...(invitation ? { invitation } : {}) };
      const result = await meetingStore(community.id, entry);
      setMeetings(result); setTab(status); setShowForm(false); setCompleting(null); setEditing(null);
      setMessage(editing ? 'Cambios de la junta guardados.' : status === 'completed' ? 'Junta realizada guardada con su acta PDF.' : 'Próxima junta guardada con su convocatoria PDF.');
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'No se pudo guardar la junta. Comprueba el espacio disponible en el navegador.'); }
    finally { setBusy(false); }
  }

  const visible = meetings.filter(meeting => meeting.status === tab).sort((a, b) => tab === 'upcoming' ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date));
  return <section className="meetings-section">
    <div className="document-upload-bar"><p>Juntas de {community.name}. PDF de hasta 10 MB, guardados solo en este navegador.</p><button className="primary" disabled={loading} onClick={() => { setEditing(null); setCompleting(null); setFormStatus(tab); setError(''); setShowForm(true); }}>Añadir junta</button></div>
    <div className="meetings-tabs" role="tablist" aria-label="Estado de las juntas">{(['upcoming', 'completed'] as const).map(status => <button key={status} role="tab" aria-selected={tab === status} onClick={() => setTab(status)}>{status === 'upcoming' ? 'Próximas juntas' : 'Juntas realizadas'} <b>{meetings.filter(meeting => meeting.status === status).length}</b></button>)}</div>
    {message && <p role="status">{message}</p>}{error && !showForm && <p role="alert" className="document-error">{error}</p>}
    {loading ? <p role="status">Cargando juntas…</p> : !visible.length && <div className="meeting-empty">Todavía no hay {tab === 'upcoming' ? 'próximas juntas' : 'juntas realizadas'} registradas. Pulsa Añadir junta para adjuntar su PDF.</div>}
    <div className="meetings-list">{visible.map(meeting => <article className="meeting-card" key={meeting.id}><div className="meeting-card-head"><div><h2>{meeting.title}</h2><p>{meeting.date.split('-').reverse().join('/')} {meeting.time && `· ${meeting.time}`} {meeting.place && `· ${meeting.place}`}</p></div><span className={meeting.status === 'completed' ? 'paid' : 'draft'}>{meeting.status === 'completed' ? 'Realizada' : 'Próxima'}</span></div>{meeting.invitation && <MeetingPDF file={meeting.invitation} label="Convocatoria" />}{meeting.minutes && <MeetingPDF file={meeting.minutes} label="Acta" />}<div className="email-selection-actions"><button type="button" className="owner-action-btn" onClick={() => setEmailMeeting(meeting)}>Preparar prueba por correo</button><button type="button" className="owner-action-btn" onClick={() => { setEditing(meeting); setCompleting(null); setFormStatus(meeting.status); setError(''); setShowForm(true); }}>Modificar junta</button>{meeting.status === 'upcoming' && <button className="owner-action-btn" onClick={() => { setEditing(null); setCompleting(meeting); setFormStatus('completed'); setError(''); setShowForm(true); }}>Marcar como realizada y subir acta</button>}</div></article>)}</div>
    {showForm && <div className="modal-backdrop"><form className="modal meeting-modal" aria-label="Añadir junta con PDF" onSubmit={submit}><div className="modal-head"><div><small>{community.name}</small><h2>{editing ? 'Modificar junta' : completing ? 'Registrar acta de la junta' : 'Añadir junta'}</h2></div><button type="button" aria-label="Cerrar formulario de junta" disabled={busy} onClick={() => setShowForm(false)}>×</button></div>
      {!completing && !editing && <label>Estado<select value={formStatus} onChange={event => setFormStatus(event.target.value as 'upcoming' | 'completed')}><option value="upcoming">Próxima junta</option><option value="completed">Junta realizada</option></select></label>}
      <label>Título<input name="title" required maxLength={150} defaultValue={editing?.title || completing?.title || ''} placeholder="Ej. Junta general ordinaria" autoFocus /></label><label>Fecha<input name="date" type="date" required defaultValue={editing?.date || completing?.date || ''} /></label><label>Hora<input name="time" type="time" defaultValue={editing?.time || completing?.time || ''} /></label><label>Lugar<input name="place" maxLength={200} defaultValue={editing?.place || completing?.place || ''} placeholder="Ej. Sala de reuniones" /></label><label>{formStatus === 'upcoming' ? 'Convocatoria PDF' : 'Acta PDF'}<input name="pdf" type="file" accept="application/pdf,.pdf" required={!editing} /></label>
      {editing && <p>Deja el archivo vacío para conservar el PDF actual.</p>}
      {editing?.status === "completed" && editing.invitation && <label>Sustituir convocatoria PDF (opcional)<input name="invitation" type="file" accept="application/pdf,.pdf" /></label>}
      {completing && <p>La convocatoria original se conserva junto al acta.</p>}{error && <p role="alert" className="document-error">{error}</p>}<div className="modal-actions"><button type="button" disabled={busy} onClick={() => setShowForm(false)}>Cancelar</button><button className="primary" type="submit" disabled={busy}>{busy ? 'Guardando…' : editing ? 'Guardar cambios' : 'Subir PDF y guardar junta'}</button></div></form></div>}
    {emailMeeting && <div className="modal-backdrop"><div className="modal meeting-modal"><div className="modal-head"><h2>Prueba por correo</h2><button type="button" aria-label="Cerrar prueba por correo" onClick={() => setEmailMeeting(null)}>×</button></div><p>Prueba únicamente al correo autorizado del administrador.</p><TestEmail key={emailMeeting.id} communityId={community.id} meeting subject={emailMeeting.title} body={`Junta: ${emailMeeting.title}\nFecha: ${emailMeeting.date.split('-').reverse().join('/')}\nHora: ${emailMeeting.time || 'Sin especificar'}\nLugar: ${emailMeeting.place || 'Sin especificar'}\nEstado: ${emailMeeting.status === 'upcoming' ? 'Próxima' : 'Realizada'}\n\nSe adjuntan los PDF de esta junta.`} attachments={[emailMeeting.invitation, emailMeeting.minutes].filter((file): file is Attachment => !!file)} /></div></div>}
  </section>;
}
