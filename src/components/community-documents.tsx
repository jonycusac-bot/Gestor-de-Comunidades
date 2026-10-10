import React, { useEffect, useState } from 'react';
import { CommunityModel } from '../data/communitiesData';
import { Icon } from './icon';

type SavedDocument = { id: string; communityId: string; title: string; category: string; date: string; filename: string; file: Blob };

function database(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('fincaflow-documents-demo', 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore('documents', { keyPath: 'id' }).createIndex('communityId', 'communityId');
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error('Cierra otras pestañas de la demo y vuelve a intentarlo.'));
  });
}

async function loadDocuments(communityId: string): Promise<SavedDocument[]> {
  const db = await database();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('documents', 'readonly');
    const request = transaction.objectStore('documents').index('communityId').getAll(communityId);
    transaction.oncomplete = () => { db.close(); resolve(request.result.reverse()); };
    transaction.onabort = () => { db.close(); reject(transaction.error); };
  });
}

async function saveDocument(document: SavedDocument) {
  const db = await database();
  return new Promise<void>((resolve, reject) => {
    const transaction = db.transaction('documents', 'readwrite');
    transaction.objectStore('documents').add(document);
    transaction.oncomplete = () => { db.close(); resolve(); };
    transaction.onabort = () => { db.close(); reject(transaction.error); };
  });
}

function DocumentFile({ document }: { document: SavedDocument; key?: string }) {
  const [url, setUrl] = useState('');
  useEffect(() => {
    const next = URL.createObjectURL(document.file);
    setUrl(next);
    return () => URL.revokeObjectURL(next);
  }, [document.file]);
  return <article className="data-row documents-row">
    <span><strong>{document.title}</strong><small>{document.filename} · {(document.file.size / 1024).toFixed(0)} KB</small></span>
    <span>{document.category}</span><span>{document.date}</span><span><em className="paid">Guardado local</em></span>
    <span className="document-links"><a href={url || undefined} target="_blank" rel="noopener noreferrer">Abrir</a><a href={url || undefined} download={document.filename}>Descargar</a></span>
  </article>;
}

export function CommunityDocuments({ community, filter }: { community: CommunityModel; filter: string; key?: string }) {
  const [documents, setDocuments] = useState<SavedDocument[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  useEffect(() => {
    let alive = true;
    loadDocuments(community.id).then(result => { if (alive) setDocuments(result); }).catch(() => { if (alive) setError('No se pudieron cargar los PDF guardados en este navegador.'); }).finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [community.id]);

  async function upload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || loading) return;
    const form = new FormData(event.currentTarget);
    const file = form.get('pdf');
    setError(''); setMessage(''); setBusy(true);
    try {
      if (!(file instanceof File) || !file.size) throw new Error('Selecciona un PDF con contenido.');
      if (!file.name.toLowerCase().endsWith('.pdf')) throw new Error('Solo se admiten archivos PDF.');
      if (file.size > 10 * 1024 * 1024) throw new Error('El PDF debe ocupar como máximo 10 MB.');
      if (await file.slice(0, 5).text() !== '%PDF-') throw new Error('El archivo no tiene una cabecera PDF válida.');
      const title = String(form.get('title') || '').trim();
      if (!title) throw new Error('Escribe un título para el documento.');
      const document: SavedDocument = { id: crypto.randomUUID(), communityId: community.id, title, category: String(form.get('category') || 'Otros'), date: new Date().toLocaleDateString('es-ES', { timeZone: 'Europe/Madrid' }), filename: file.name, file: file.slice(0, file.size, 'application/pdf') };
      await saveDocument(document);
      setDocuments(previous => [document, ...previous]);
      setShowForm(false);
      setMessage(`PDF guardado en Documentos de ${community.name}.`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo guardar el PDF. Comprueba el espacio disponible en el navegador.');
    } finally { setBusy(false); }
  }

  const matches = (title: string) => title.toLocaleLowerCase('es-ES').includes(filter.toLocaleLowerCase('es-ES'));
  return <>
    <div className="document-upload-bar"><p>Los PDF se guardan solo en este navegador y para esta comunidad. Máximo 10 MB por archivo.</p><button className="primary" disabled={loading} onClick={() => { setShowForm(true); setError(''); setMessage(''); }}><Icon name="plus" size={18} /> Subir PDF</button></div>
    {message && <p role="status">{message}</p>}
    {error && <p role="alert" className="document-error">{error}</p>}
    {loading && <p role="status">Cargando documentos…</p>}
    <div className="data-panel">
      <div className="data-head documents-head"><span>Documento</span><span>Categoría</span><span>Fecha</span><span>Estado</span><span>Archivo</span></div>
      {documents.filter(d => matches(d.title)).map(document => <DocumentFile key={document.id} document={document} />)}
      {community.documents.filter(d => matches(d.title)).map((d, index) => <article className="data-row documents-row" key={`${d.title}-${index}`}><span><strong>{d.title}</strong><small>{d.files} · Ejemplo sin PDF adjunto</small></span><span>{d.category}</span><span>{d.date}</span><span><em className={d.status === 'Publicado' ? 'paid' : 'draft'}>{d.status}</em></span><span>Ejemplo</span></article>)}
      {!loading && !documents.some(d => matches(d.title)) && !community.documents.some(d => matches(d.title)) && <p className="document-empty">No hay documentos que coincidan con la búsqueda.</p>}
    </div>
    {showForm && <div className="modal-backdrop"><form className="modal" onSubmit={upload} aria-label="Subir PDF a la comunidad"><div className="modal-head"><div><small>{community.name}</small><h2>Subir PDF</h2></div><button type="button" aria-label="Cerrar formulario" disabled={busy} onClick={() => setShowForm(false)}>×</button></div><label>Título<input name="title" required maxLength={150} autoFocus placeholder="Ej. Acta de la junta" /></label><label>Categoría<select name="category"><option>Actas</option><option>Convocatorias</option><option>Presupuestos</option><option>Informes técnicos</option><option>Otros</option></select></label><label>Archivo PDF<input type="file" name="pdf" accept="application/pdf,.pdf" required /></label><p>Se añadirá a Documentos de <strong>{community.name}</strong>.</p>{error && <p role="alert" className="document-error">{error}</p>}<div className="modal-actions"><button type="button" disabled={busy} onClick={() => setShowForm(false)}>Cancelar</button><button type="submit" className="primary" disabled={busy}>{busy ? 'Subiendo…' : 'Subir PDF'}</button></div></form></div>}
  </>;
}
