const SUPABASE_URL = (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_SUPABASE_URL) || "https://wytejpxqujzazgyfdobt.supabase.co";
const SUPABASE_KEY = (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) || "sb_publishable_HbLV5Jp1xxD4qHFvNnacYA_Kt_AoOvr";
const SESSION_KEY = "fincaflow-auth-session";

export type AuthSession = {
  access_token: string;
  refresh_token: string;
  expires_at?: number;
  user: { id: string; email?: string };
};

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${SUPABASE_URL}/auth/v1/${path}`, {
    ...init,
    headers: { apikey: SUPABASE_KEY, "Content-Type": "application/json", ...init.headers },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data?.msg || data?.message || "No se pudo completar el acceso");
  return data as T;
}

export async function signIn(email: string, password: string) {
  const session = await request<AuthSession>("token?grant_type=password", {
    method: "POST", body: JSON.stringify({ email, password }),
  });
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

export async function restoreSession() {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  const session = JSON.parse(raw) as AuthSession;
  await request("user", { headers: { Authorization: `Bearer ${session.access_token}` } });
  return session;
}

export async function signOut(session: AuthSession | null) {
  if (session) {
    await request("logout", {
      method: "POST", headers: { Authorization: `Bearer ${session.access_token}` },
    }).catch(() => undefined);
  }
  localStorage.removeItem(SESSION_KEY);
}
