import React, { useEffect, useState } from 'react';

export function TestEmail({ communityId, subject, body }: { communityId: string; subject: string; body: string }) {
  const [config, setConfig] = useState<{ configured: boolean; recipient: string } | null>(null);
  const [review, setReview] = useState(false);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');
  const [requestId, setRequestId] = useState('');
  useEffect(() => {
    let alive = true;
    fetch('/api/email-test/status').then(response => { if (!response.ok) throw new Error(); return response.json(); }).then(data => { if (alive) setConfig(data); }).catch(() => { if (alive) setConfig(null); });
    return () => { alive = false; };
  }, []);
  useEffect(() => { setReview(false); setMessage(''); setRequestId(crypto.randomUUID()); }, [subject, body, communityId]);
  if (communityId !== 'bel-air') return null;
  async function send() {
    setSending(true); setMessage('');
    try {
      const response = await fetch('/api/email-test/send', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-fincaflow-test': '1' }, body: JSON.stringify({ subject, body, communityId, requestId }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'No se pudo completar la prueba.');
      setMessage(`Resend ha aceptado el correo para ${result.recipient}. Referencia: ${result.id}. Comprueba tu bandeja de entrada y spam; todavía no se ha verificado la entrega.`);
      setReview(false);
    } catch (error) { setMessage(error instanceof Error ? error.message : 'No se pudo confirmar el resultado del envío. Revisa Resend antes de reintentar.'); }
    finally { setSending(false); }
  }
  return <section className="email-preview" aria-label="Envío real de prueba">
    <h3>Envío real de prueba · Portal 4, puerta 2</h3>
    <p>Una única dirección autorizada: <strong>{config?.recipient || 'pendiente de configuración local'}</strong>. La selección general de propietarios no se utiliza para esta prueba.</p>
    {!config?.configured && <p>Para activar el botón, configura RESEND_API_KEY en el archivo .env del PC y reinicia el servidor. La cuenta de Resend debe usar el correo autorizado.</p>}
    <button type="button" className="primary" disabled={!config?.configured || !subject.trim() || !body.trim() || sending} onClick={() => setReview(true)}>Revisar prueba a mi correo</button>
    {review && <div><h4>{subject}</h4><p className="email-message-body">{body}</p><p>Este botón enviará un correo real únicamente a {config?.recipient}.</p><div className="email-selection-actions"><button disabled={sending} type="button" onClick={() => setReview(false)}>Cancelar</button><button disabled={sending} type="button" className="primary" onClick={() => void send()}>{sending ? 'Enviando…' : 'Enviar prueba real'}</button></div></div>}
    {message && <p role="status">{message}</p>}
  </section>;
}
