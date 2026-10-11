import React, { useEffect, useRef, useState } from 'react';
import { useSession } from './auth-gate';
import { CloudMessage, CloudThread, Member, getMembers, getMessages, getThreads, messagesApi } from '../lib/cloud-messages';
import './owner-messages.css';

export function PrivateMessages({ portal = false }: { portal?: boolean }) {
  const session = useSession();
  const [member, setMember] = useState<Member | null>(null);
  const [threads, setThreads] = useState<CloudThread[]>([]);
  const [selected, setSelected] = useState<CloudThread | null>(null);
  const [messages, setMessages] = useState<CloudMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [reply, setReply] = useState('');
  const draftId = useRef(crypto.randomUUID());
  const replyId = useRef(crypto.randomUUID());
  const request = useRef(0);
  const lock = useRef(false);
  const currentId = useRef<string | null>(null);

  async function refresh() {
    if (!session) { setLoading(false); return; }
    const version = ++request.current;
    setLoading(true); setError('');
    try {
      const members = await getMembers(session);
      const access = members.find(m => m.community_id === 'bel-air' && m.role === (portal ? 'owner' : 'manager'));
      if (!access) { setMember(null); setThreads([]); setSelected(null); setMessages([]); return; }
      const list = await getThreads(session);
      if (version !== request.current) return;
      setMember(access); setThreads(list);
      const current = list.find(t => t.id === currentId.current) || null;
      const history = current ? await getMessages(session, current.id) : [];
      if (version !== request.current) return;
      setSelected(current); setMessages(history);
    } catch (cause) { if (version === request.current) setError(cause instanceof Error ? cause.message : 'No se pudo cargar la bandeja.'); }
    finally { if (version === request.current) setLoading(false); }
  }
  useEffect(() => { refresh(); return () => { ++request.current; }; }, [session, portal]);

  async function open(thread: CloudThread) {
    if (!session || busy) return;
    const version = ++request.current;
    currentId.current = thread.id; setSelected(thread); setMessages([]); setReply(''); replyId.current = crypto.randomUUID(); setError(''); setLoading(true);
    try { const history = await getMessages(session, thread.id); if (version === request.current) setMessages(history); }
    catch (cause) { if (version === request.current) setError(cause instanceof Error ? cause.message : 'No se pudo cargar el historial.'); }
    finally { if (version === request.current) setLoading(false); }
  }
  async function perform(action: () => Promise<void>) {
    if (lock.current) return;
    lock.current = true; setBusy(true); setError(''); setNotice('');
    try { await action(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'No se pudo guardar. Tu texto se conserva.'); }
    finally { lock.current = false; setBusy(false); }
  }

  if (!session) return <section className="owner-messages"><h2>Portal privado del propietario</h2><p>Para enviar mensajes reales, sal de la demostración e inicia sesión con tu cuenta de propietario.</p></section>;
  return <section className="owner-messages" aria-label="Mensajería privada">
    <h2>{portal ? 'Mis mensajes · Terrazas de Bel Air' : 'Bandeja privada · Terrazas de Bel Air'}</h2>
    <p>Prueba privada. Mensajes de texto guardados en Supabase; sin correos ni adjuntos.</p>
    <div className="messages-controls"><button type="button" disabled={busy || loading} onClick={refresh}>Actualizar mensajes</button></div>
    {error && <p role="alert">{error}</p>}
    <p role="status">{loading ? 'Cargando mensajes…' : notice}</p>
    {!loading && !member && <p>Esta cuenta no tiene activado este acceso. La administración debe vincularla a Terrazas de Bel Air.</p>}
    {member && <>
      <p>{member.display_name}{member.home ? ` · ${member.home}` : ''}</p>
      {portal && <form className="messages-compose" onSubmit={e => { e.preventDefault(); if (!subject.trim() || !body.trim()) return; void perform(async () => {
        const id = draftId.current;
        await messagesApi(session, 'rpc/fincaflow_start_thread', { method: 'POST', body: JSON.stringify({ thread_id: id, title: subject.trim(), body: body.trim() }) });
        setSubject(''); setBody(''); draftId.current = crypto.randomUUID(); currentId.current = id;
        await refresh(); setNotice('Mensaje enviado a la administración.');
      }); }}>
        <h3>Nuevo mensaje</h3>
        <label>Asunto<input required maxLength={120} disabled={busy} value={subject} onChange={e => { setSubject(e.target.value); draftId.current = crypto.randomUUID(); }} /></label>
        <label>Mensaje<textarea required maxLength={4000} rows={4} disabled={busy} value={body} onChange={e => { setBody(e.target.value); draftId.current = crypto.randomUUID(); }} /></label>
        <button className="primary" disabled={busy || loading || !subject.trim() || !body.trim()}>{busy ? 'Enviando…' : 'Enviar mensaje'}</button>
      </form>}
      <div className="messages-layout">
        <div className="messages-list" aria-label="Conversaciones">
          {!threads.length && !loading && <p>Aún no hay conversaciones.{portal ? ' Escribe tu primer mensaje arriba.' : 'Aquí aparecerán los mensajes del propietario autorizado.'}</p>}
          {threads.map(t => <button type="button" key={t.id} disabled={busy || loading} aria-pressed={selected?.id === t.id} onClick={() => open(t)}><strong>{t.subject}</strong><span>{t.state} · {new Date(t.created_at).toLocaleDateString('es-ES', { timeZone: 'Europe/Madrid' })}</span></button>)}
        </div>
        <div className="messages-detail">
          {!selected ? <p>Selecciona una conversación para leerla.</p> : <>
            <h3>{selected.subject}</h3><p>Estado: <strong>{selected.state}</strong></p>
            {!portal && <label>Estado<select disabled={busy || loading} value={selected.state} onChange={e => { const state = e.target.value; void perform(async () => {
              const rows = await messagesApi<CloudThread[]>(session, `fincaflow_threads?id=eq.${selected.id}`, { method: 'PATCH', headers: { Prefer: 'return=representation' }, body: JSON.stringify({ state }) });
              if (!rows.length) throw new Error('No se pudo cambiar el estado. Actualiza los mensajes.');
              await refresh(); setNotice('Estado actualizado.');
            }); }}><option>Nueva</option><option>En gestión</option><option>Resuelta</option></select></label>}
            {!loading && <ol className="messages-history">{messages.map(m => <li key={m.id} className={m.sender_id === selected.owner_id ? 'owner' : 'manager'}><strong>{m.sender_id === selected.owner_id ? 'Propietario' : 'Administración'}</strong><time dateTime={m.created_at}>{new Date(m.created_at).toLocaleString('es-ES', { timeZone: 'Europe/Madrid' })}</time><p>{m.body}</p></li>)}</ol>}
            <form onSubmit={e => { e.preventDefault(); if (!reply.trim()) return; void perform(async () => {
              // El ID se conserva al reintentar: consulta la confirmación antes de repetir.
              const id = replyId.current;
              const existing = await messagesApi<CloudMessage[]>(session, `fincaflow_messages?id=eq.${id}&select=*`);
              if (!existing.length) await messagesApi(session, 'fincaflow_messages', { method: 'POST', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ id, thread_id: selected.id, body: reply.trim() }) });
              setReply(''); replyId.current = crypto.randomUUID(); await refresh(); setNotice('Respuesta enviada.');
            }); }}><label>Respuesta<textarea rows={4} required maxLength={4000} disabled={busy} value={reply} onChange={e => { setReply(e.target.value); replyId.current = crypto.randomUUID(); }} /></label><button className="primary" disabled={busy || loading || !reply.trim()}>{busy ? 'Enviando…' : 'Enviar respuesta'}</button></form>
          </>}
        </div>
      </div>
    </>}
  </section>;
}
