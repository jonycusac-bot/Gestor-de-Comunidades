import React, { useEffect, useState } from "react";
import "./owner-messages.css";

type Message = { id: string; author: "owner" | "manager"; text: string; date: string };
type Thread = { id: string; subject: string; state: "Nueva" | "En gestión" | "Resuelta"; messages: Message[] };
const prefix = "fincaflow-messages-local-v1-";

function read(key: string): Thread[] {
  const raw = localStorage.getItem(key);
  if (!raw) return [];
  const data: unknown = JSON.parse(raw);
  if (!Array.isArray(data) || !data.every(t => t && typeof t.id === "string" && typeof t.subject === "string" && ["Nueva", "En gestión", "Resuelta"].includes(t.state) && Array.isArray(t.messages) && t.messages.every((m: Message) => m && typeof m.id === "string" && ["owner", "manager"].includes(m.author) && typeof m.text === "string" && typeof m.date === "string" && Number.isFinite(Date.parse(m.date))))) {
    throw new Error("Datos de mensajería no válidos");
  }
  return data;
}

export function OwnerMessages({ communityId, communityName }: { key?: string; communityId: string; communityName: string }) {
  const key = prefix + communityId;
  const [threads, setThreads] = useState<Thread[]>([]);
  const [role, setRole] = useState<"owner" | "manager">("manager");
  const [selected, setSelected] = useState<string | null>(null);
  const [subject, setSubject] = useState("");
  const [text, setText] = useState("");
  const [reply, setReply] = useState("");
  const [feedback, setFeedback] = useState("");
  const [loadError, setLoadError] = useState(false);
  const current = threads.find(t => t.id === selected);

  function refresh() {
    try { setThreads(read(key)); setLoadError(false); }
    catch { setLoadError(true); setFeedback("No se pudieron leer los mensajes. No se sobrescribirán. Comprueba el almacenamiento del navegador y pulsa Actualizar."); }
  }
  useEffect(() => {
    refresh();
    const sync = (event: StorageEvent) => { if (event.key === key || event.key === null) refresh(); };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, [key]);

  function save(change: (latest: Thread[]) => Thread[], success: string) {
    try {
      const next = change(read(key));
      localStorage.setItem(key, JSON.stringify(next));
      setThreads(next); setFeedback(success); return true;
    } catch { setFeedback("No se ha guardado. Comprueba el almacenamiento del navegador y vuelve a intentarlo; tu texto se conserva."); return false; }
  }
  function message(value: string): Message { return { id: crypto.randomUUID(), author: role, text: value.trim(), date: new Date().toISOString() }; }

  return <section className="owner-messages" aria-label="Prueba de mensajería de propietarios">
    <p className="messages-demo"><strong>Prueba local · datos ficticios.</strong> Los dos roles son una simulación en este navegador. No hay envío a Supabase, correo ni acceso privado real.</p>
    <div className="messages-controls">
      <button type="button" aria-pressed={role === "manager"} onClick={() => { setRole("manager"); setFeedback(""); }}>Bandeja del gestor</button>
      <button type="button" aria-pressed={role === "owner"} onClick={() => { setRole("owner"); setFeedback(""); }}>Probar como propietario</button>
      <button type="button" onClick={refresh}>Actualizar</button>
    </div>
    <h2>{role === "owner" ? "Mis mensajes" : "Mensajes recibidos"}</h2>
    <p>{communityName} · Propietaria ficticia: Ana Ejemplo · Portal demo · Vivienda A</p>
    <p role="status">{feedback}</p>
    {role === "owner" && <form className="messages-compose" onSubmit={e => {
      e.preventDefault(); if (!subject.trim() || !text.trim() || loadError) return;
      const thread: Thread = { id: crypto.randomUUID(), subject: subject.trim(), state: "Nueva", messages: [message(text)] };
      if (save(latest => [thread, ...latest], "Mensaje guardado en la prueba local. Cambia a Bandeja del gestor para recibirlo.")) { setSubject(""); setText(""); setSelected(thread.id); }
    }}>
      <h3>Nuevo mensaje a la administración</h3>
      <label>Asunto<input required maxLength={120} value={subject} onChange={e => setSubject(e.target.value)} /></label>
      <label>Mensaje<textarea required maxLength={4000} rows={4} value={text} onChange={e => setText(e.target.value)} /></label>
      <button className="primary" disabled={loadError || !subject.trim() || !text.trim()}>Enviar mensaje de prueba</button>
    </form>}
    <div className="messages-layout">
      <div className="messages-list" aria-label="Conversaciones">
        {!threads.length && !loadError && <p>Aún no hay mensajes. Pulsa Probar como propietario para enviar el primero.</p>}
        {threads.map(t => <button key={t.id} type="button" aria-pressed={selected === t.id} onClick={() => { setSelected(t.id); setReply(""); setFeedback(""); }}>
          <strong>{t.subject}</strong><span>{t.state} · {t.messages.length} mensajes</span>
        </button>)}
      </div>
      <div className="messages-detail">
        {!current ? <p>Selecciona una conversación para ver el historial.</p> : <>
          <h3>{current.subject}</h3>
          <p>Estado: <strong>{current.state}</strong></p>
          {role === "manager" && <label>Estado de la conversación<select value={current.state} disabled={loadError} onChange={e => {
            const state = e.target.value as Thread["state"];
            save(latest => latest.map(t => t.id === current.id ? { ...t, state } : t), "Estado guardado en local.");
          }}><option>Nueva</option><option>En gestión</option><option>Resuelta</option></select></label>}
          <ol className="messages-history">{current.messages.map(m => <li key={m.id} className={m.author}>
            <strong>{m.author === "owner" ? "Ana Ejemplo · Propietaria ficticia" : "Administración"}</strong>
            <time dateTime={m.date}>{new Date(m.date).toLocaleString("es-ES", { timeZone: "Europe/Madrid" })}</time>
            <p>{m.text}</p>
          </li>)}</ol>
          <form onSubmit={e => {
            e.preventDefault(); if (!reply.trim() || loadError) return;
            const item = message(reply);
            if (save(latest => {
              if (!latest.some(t => t.id === current.id)) throw new Error("Conversación no disponible");
              return latest.map(t => t.id === current.id ? { ...t, state: role === "owner" ? "Nueva" : "En gestión", messages: [...t.messages, item] } : t);
            }, "Respuesta guardada en local. Cambia de rol para verla.")) setReply("");
          }}>
            <label>Tu respuesta<textarea required maxLength={4000} rows={4} value={reply} onChange={e => setReply(e.target.value)} /></label>
            <button className="primary" disabled={loadError || !reply.trim()}>Enviar respuesta de prueba</button>
          </form>
        </>}
      </div>
    </div>
  </section>;
}
