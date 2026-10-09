import React, { useEffect, useState } from "react";
import { CommunityModel } from "../data/communitiesData";
import { TestEmail } from "./test-email";

type Communication = { id: string; subject: string; body: string; emails: string[]; date: string };
export function emailRecipients(community: CommunityModel) {
  return [...new Set(community.owners.map(owner => owner.email.trim().toLowerCase()).filter(email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && !email.endsWith(".local")))];
}

export function EmailCommunications({ community }: { community: CommunityModel }) {
  const [selected, setSelected] = useState<string[]>([]);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [preview, setPreview] = useState(false);
  const [history, setHistory] = useState<Communication[]>([]);
  const [message, setMessage] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const storageKey = `fincaflow-email-demo-v1-${community.id}`;
  const emails = emailRecipients(community);
  const recipients = selected.filter(email => emails.includes(email));
  useEffect(() => {
    setSelected(emailRecipients(community)); setSubject(""); setBody(""); setPreview(false); setMessage(""); setExpanded(null); setHistory([]);
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (!Array.isArray(parsed) || parsed.some(item => typeof item.id !== "string" || typeof item.subject !== "string" || typeof item.body !== "string" || !Array.isArray(item.emails) || item.emails.some(email => typeof email !== "string") || typeof item.date !== "string")) throw new Error();
        setHistory(parsed);
      }
    } catch { setMessage("No se pudo recuperar el historial local de esta comunidad."); }
  }, [storageKey]);

  function simulate() {
    if (!recipients.length || !subject.trim() || !body.trim()) return;
    const entry: Communication = { id: crypto.randomUUID(), subject: subject.trim(), body: body.trim(), emails: recipients, date: new Date().toISOString() };
    const next = [entry, ...history];
    try {
      localStorage.setItem(storageKey, JSON.stringify(next)); setHistory(next); setPreview(false); setSubject(""); setBody("");
      setMessage(`Simulación registrada para ${recipients.length} direcciones. No se ha enviado ningún correo.`);
    } catch { setMessage("No se pudo guardar la simulación. El mensaje sigue disponible para reintentar."); }
  }

  return <div>
    <form className="email-composer" onSubmit={event => { event.preventDefault(); if (recipients.length && subject.trim() && body.trim()) { setMessage(""); setPreview(true); } }}>
      <div className="email-composer-head"><div><h2>Enviar comunicado por correo</h2><p>{community.name} · El envío general es simulado. La prueba real individual se revisa por separado.</p></div></div>
      <fieldset className="email-recipient-selection"><legend>Destinatarios de esta comunidad · {recipients.length} direcciones seleccionadas</legend>
        <div className="email-selection-actions"><button type="button" onClick={() => { setSelected(emails); setPreview(false); }}>Seleccionar todos</button><button type="button" onClick={() => { setSelected([]); setPreview(false); }}>Quitar selección</button></div>
        {emails.length ? <div className="email-recipient-list">{emails.map(email => <label key={email}><input type="checkbox" checked={selected.includes(email)} onChange={event => { setSelected(event.target.checked ? [...selected, email] : selected.filter(value => value !== email)); setPreview(false); }} /><span><strong>{community.owners.filter(owner => owner.email.trim().toLowerCase() === email).map(owner => `${owner.name} · ${owner.home}`).join(" / ")}</strong><small>{email}</small></span></label>)}</div> : <p>No hay correos válidos. Añádelos en Propietarios para preparar un comunicado.</p>}
        <p>Una dirección compartida recibe un único comunicado. Se excluyen correos vacíos, inválidos y direcciones provisionales .local.</p>
      </fieldset>
      <label>Empezar con una plantilla<select defaultValue="" onChange={event => {
        setPreview(false);
        if (event.target.value === "notice") { setSubject(`Aviso de mantenimiento · ${community.name}`); setBody(`Estimados propietarios:\n\nLes informamos de que se realizará una actuación de mantenimiento en la comunidad.\n\nFecha: [completar]\nHorario: [completar]\nZona afectada: [completar]\n\nGracias por su colaboración.\nLa administración`); }
        if (event.target.value === "meeting") { setSubject(`Información sobre próxima junta · ${community.name}`); setBody("Estimados propietarios:\n\nLes comunicamos la próxima reunión de la comunidad.\n\nFecha y hora: [completar]\nLugar: [completar]\nTemas a tratar: [completar]\n\nLa administración"); }
      }}><option value="">Redactar libremente</option><option value="notice">Aviso de mantenimiento</option><option value="meeting">Información de una junta</option></select></label>
      <label>Asunto<input required maxLength={180} value={subject} onChange={event => { setSubject(event.target.value); setPreview(false); }} placeholder="Asunto del comunicado" /></label>
      <label>Mensaje<textarea required maxLength={10000} rows={8} value={body} onChange={event => { setBody(event.target.value); setPreview(false); }} placeholder="Escribe el mensaje que recibirán los propietarios…" /></label>
      <div className="email-composer-footer"><small>El comunicado se prepara individualmente para cada dirección, sin exponer los correos de los demás propietarios.</small><button className="primary" type="submit" disabled={!recipients.length || !subject.trim() || !body.trim()}>Revisar comunicado</button></div>
      {preview && <section className="email-preview" aria-label="Vista previa del comunicado"><h3>Revisión antes de simular</h3><p><strong>{community.name}</strong> · {recipients.length} direcciones</p><details><summary>Ver destinatarios</summary>{recipients.map(email => <p key={email}>{email}</p>)}</details><h4>{subject}</h4><p className="email-message-body">{body}</p><p>Simulación local: no se enviará ningún correo.</p><div className="email-selection-actions"><button type="button" onClick={() => setPreview(false)}>Volver a editar</button><button type="button" className="primary" onClick={simulate}>Confirmar simulación</button></div></section>}
      <TestEmail communityId={community.id} subject={subject} body={body} />
      {message && <p role="status" className="email-local-message">{message}</p>}
    </form>
    <section className="email-history"><h2>Historial de comunicados de prueba</h2><p>Guardado solo en este navegador. «Simulado» no significa enviado ni entregado.</p>{!history.length && <p>Todavía no hay comunicados registrados para esta comunidad.</p>}{history.map(item => <article key={item.id}><button type="button" aria-expanded={expanded === item.id} onClick={() => setExpanded(expanded === item.id ? null : item.id)}><strong>{item.subject}</strong><span>{item.emails.length} direcciones · {new Date(item.date).toLocaleString("es-ES", { timeZone: "Europe/Madrid" })} · Simulado</span></button>{expanded === item.id && <div><p className="email-message-body">{item.body}</p><details><summary>Destinatarios registrados</summary>{item.emails.map(email => <p key={email}>{email}</p>)}</details></div>}</article>)}</section>
  </div>;
}
