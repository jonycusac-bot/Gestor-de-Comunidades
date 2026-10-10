import type { Express, Request } from 'express';

function localRequest(req: Request) {
  const loopback = ['127.0.0.1', '::1', '::ffff:127.0.0.1'];
  if (!loopback.includes(req.socket.remoteAddress || '') || !['localhost', '127.0.0.1', '[::1]'].includes(req.hostname)) return false;
  const origin = req.get('origin');
  return !origin || origin === `http://${req.get('host')}`;
}

export function registerEmailTest(app: Express) {
  let lastAttempt = 0;
  let sending = false;
  const config = () => ({
    enabled: process.env.EMAIL_TEST_ENABLED === 'true' && process.env.NODE_ENV !== 'production',
    recipient: process.env.EMAIL_TEST_RECIPIENT?.trim().toLowerCase() || '',
    key: process.env.RESEND_API_KEY?.trim() || '',
  });
  app.get('/api/email-test/status', (req, res) => {
    if (!localRequest(req)) return res.status(403).json({ error: 'Prueba disponible solo en el servidor local.' });
    const { enabled, recipient, key } = config();
    res.json({ configured: enabled && !!key && !!recipient, recipient: enabled ? recipient : '', enabled });
  });
  app.post('/api/email-test/send', async (req, res) => {
    if (!localRequest(req) || req.get('x-fincaflow-test') !== '1') return res.status(403).json({ error: 'Prueba disponible solo desde la aplicación local.' });
    const { enabled, recipient, key } = config();
    if (!enabled || !key || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient)) return res.status(503).json({ error: 'Falta configurar Resend en el servidor local.' });
    const { subject, body, communityId, requestId, attachments = [], meeting = false } = req.body || {};
    if (communityId !== 'bel-air') return res.status(400).json({ error: 'Esta prueba está limitada a Terrazas de Bel Air.' });
    if (typeof subject !== 'string' || !subject.trim() || subject.length > 180 || /[\r\n]/.test(subject) || typeof body !== 'string' || !body.trim() || body.length > 10000 || typeof requestId !== 'string' || !/^[\da-f-]{36}$/i.test(requestId)) return res.status(400).json({ error: 'Revisa el asunto y el mensaje.' });
    if (!Array.isArray(attachments) || attachments.length > 2) return res.status(400).json({ error: 'Máximo dos PDF adjuntos.' });
    let totalBytes = 0;
    for (const file of attachments) {
      if (!file || typeof file.filename !== 'string' || file.filename.length > 240 || !file.filename.toLowerCase().endsWith('.pdf') || /[\r\n/\\]/.test(file.filename) || typeof file.content !== 'string' || file.content.length > 7 * 1024 * 1024 || !/^[A-Za-z0-9+/]*={0,2}$/.test(file.content)) return res.status(400).json({ error: 'PDF adjunto inválido.' });
      const bytes = Buffer.from(file.content, 'base64');
      totalBytes += bytes.length;
      if (bytes.subarray(0, 5).toString() !== '%PDF-' || totalBytes > 5 * 1024 * 1024) return res.status(400).json({ error: 'Adjunta PDF válidos de hasta 5 MB en total.' });
    }
    if (sending || Date.now() - lastAttempt < 60000) return res.status(429).json({ error: 'Espera un minuto antes de repetir la prueba.' });
    sending = true;
    lastAttempt = Date.now();
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', 'Idempotency-Key': requestId },
        body: JSON.stringify({ from: 'FincaFlow Demo <onboarding@resend.dev>', to: [recipient], subject: `[PRUEBA FincaFlow] ${subject.trim()}`, attachments: attachments.map(file => ({ filename: file.filename, content: file.content, content_type: 'application/pdf' })), text: `Terrazas de Bel Air\n${meeting === true ? 'Prueba de comunicación de junta' : 'Prueba para el propietario de portal 4, puerta 2'}\n\n${body.trim()}\n\nMensaje de prueba. No acredita ninguna notificación formal.` }),
        signal: AbortSignal.timeout(15000),
      });
      const result = await response.json();
      if (!response.ok || !result.id) return res.status(502).json({ error: 'Resend no ha aceptado el envío. Comprueba la clave y que el destinatario sea el correo de tu cuenta Resend.' });
      res.json({ id: result.id, recipient, status: 'accepted' });
    } catch {
      res.status(502).json({ error: 'No se pudo confirmar el resultado. Puede haberse enviado; revisa Resend o tu buzón antes de reintentar.' });
    } finally { sending = false; }
  });
}
