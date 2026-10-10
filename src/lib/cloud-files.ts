import { AuthSession, refreshSession, SUPABASE_KEY, SUPABASE_URL } from './supabase-auth';

type Kind = 'documents' | 'meetings';
type FileRef = { path: string; name: string };
type Entry = { id: string; communityId: string; file?: Blob; filename?: string; invitation?: { name: string; blob: Blob }; minutes?: { name: string; blob: Blob } };
const bucket = 'fincaflow-private';
const storedBlobs = new WeakMap<Blob, FileRef>();

async function api(session: AuthSession, path: string, init: RequestInit = {}) {
  const send = () => fetch(`${SUPABASE_URL}${path}`, { ...init, headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${session.access_token}`, ...init.headers } });
  let response = await send();
  if (response.status === 401) { await refreshSession(session); response = await send(); }
  if (!response.ok) throw new Error('No se pudo acceder al almacenamiento privado. Comprueba la conexión y vuelve a iniciar sesión si el problema continúa.');
  return response;
}

export async function loadCloud<T extends Entry>(session: AuthSession, communityId: string, kind: Kind): Promise<T[]> {
  const records: { data: Record<string, unknown> }[] = [];
  for (let offset = 0; ; offset += 100) {
    const query = new URLSearchParams({ select: 'data', community_id: `eq.${communityId}`, owner_id: `eq.${session.user.id}`, kind: `eq.${kind}`, order: 'updated_at.desc,id.asc', limit: '100', offset: String(offset) });
    const page = await (await api(session, `/rest/v1/fincaflow_files?${query}`)).json();
    records.push(...page);
    if (page.length < 100) break;
  }
  return Promise.all(records.map(async ({ data }) => {
    const entry = { ...data };
    for (const key of ['file', 'invitation', 'minutes']) {
      const ref = entry[key] as FileRef | undefined;
      if (!ref) continue;
      // Never fetch an arbitrary URL or another account's object from metadata.
      const prefix = `${session.user.id}/${encodeURIComponent(communityId)}/`;
      if (!ref.path?.startsWith(prefix)) throw new Error('Referencia de PDF no válida.');
      const path = ref.path.split('/').map(encodeURIComponent).join('/');
      const blob = await (await api(session, `/storage/v1/object/authenticated/${bucket}/${path}`)).blob();
      storedBlobs.set(blob, ref);
      entry[key] = key === 'file' ? blob : { name: ref.name, blob };
    }
    return entry as T;
  }));
}

export async function saveCloud<T extends Entry>(session: AuthSession, kind: Kind, entry: T): Promise<void> {
  const data: Record<string, unknown> = { ...entry };
  for (const key of ['file', 'invitation', 'minutes'] as const) {
    const value = entry[key];
    if (!value) continue;
    const blob = value instanceof Blob ? value : value.blob;
    const name = value instanceof Blob ? entry.filename : value.name;
    const stored = storedBlobs.get(blob);
    if (stored?.path.startsWith(`${session.user.id}/${encodeURIComponent(entry.communityId)}/`)) {
      data[key] = stored;
      continue;
    }
    const path = `${session.user.id}/${encodeURIComponent(entry.communityId)}/${crypto.randomUUID()}.pdf`;
    await api(session, `/storage/v1/object/${bucket}/${path.split('/').map(encodeURIComponent).join('/')}`, { method: 'POST', headers: { 'Content-Type': 'application/pdf' }, body: blob });
    data[key] = { path, name };
    storedBlobs.set(blob, { path, name: name || 'documento.pdf' });
  }
  // Publish metadata only after all PDFs have been stored successfully.
  await api(session, '/rest/v1/fincaflow_files?on_conflict=owner_id,community_id,kind,id', {
    method: 'POST', headers: { 'Content-Type': 'application/json', Prefer: 'resolution=merge-duplicates' },
    body: JSON.stringify({ owner_id: session.user.id, community_id: entry.communityId, kind, id: entry.id, data, updated_at: new Date().toISOString() }),
  });
}
