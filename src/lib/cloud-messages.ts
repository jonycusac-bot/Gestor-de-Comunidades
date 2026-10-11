import { AuthSession, refreshSession, SUPABASE_KEY, SUPABASE_URL } from './supabase-auth';
export type Member = { role: 'owner' | 'manager'; community_id: string; display_name: string; home: string };
export type CloudThread = { id: string; owner_id: string; subject: string; state: 'Nueva' | 'En gestión' | 'Resuelta'; created_at: string };
export type CloudMessage = { id: string; sender_id: string; body: string; created_at: string };
export async function messagesApi<T>(session: AuthSession, path: string, init: RequestInit = {}): Promise<T> {
  const send = () => fetch(`${SUPABASE_URL}/rest/v1/${path}`, { ...init, headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${session.access_token}`, 'Content-Type': 'application/json', ...init.headers } });
  let response = await send();
  if (response.status === 401) { await refreshSession(session); response = await send(); }
  if (!response.ok) throw new Error('No se pudo completar la operación. Comprueba la conexión y que tu cuenta tenga activada la mensajería. Tu texto se conserva.');
  return (response.status === 204 ? undefined : await response.json()) as T;
}
export const getMembers = (s: AuthSession) => messagesApi<Member[]>(s, 'fincaflow_message_members?select=role,community_id,display_name,home');
export async function getThreads(s: AuthSession): Promise<CloudThread[]> {
  const result: CloudThread[] = [];
  for (let offset = 0; ; offset += 100) {
    const page = await messagesApi<CloudThread[]>(s, `fincaflow_threads?select=*&order=created_at.desc,id.desc&limit=100&offset=${offset}`);
    result.push(...page); if (page.length < 100) return result;
  }
}
export async function getMessages(s: AuthSession, id: string): Promise<CloudMessage[]> {
  const result: CloudMessage[] = [];
  for (let offset = 0; ; offset += 100) {
    const page = await messagesApi<CloudMessage[]>(s, `fincaflow_messages?select=*&thread_id=eq.${encodeURIComponent(id)}&order=created_at.asc,id.asc&limit=100&offset=${offset}`);
    result.push(...page); if (page.length < 100) return result;
  }
}
