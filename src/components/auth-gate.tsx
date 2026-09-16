"use client";

import { FormEvent, ReactNode, useEffect, useState } from "react";
import { AuthSession, restoreSession, signIn, signOut } from "@/lib/supabase-auth";
import styles from "./auth-gate.module.css";

export function AuthGate({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [demo, setDemo] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    restoreSession().then(setSession).catch(() => signOut(null)).finally(() => setChecking(false));
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true); setError("");
    const form = new FormData(event.currentTarget);
    try {
      setSession(await signIn(String(form.get("email") || "").trim(), String(form.get("password") || "")));
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "No se pudo iniciar sesión";
      setError(message.toLowerCase().includes("invalid login") ? "Correo o contraseña incorrectos." : message);
    } finally { setBusy(false); }
  }

  if (checking) return <main className={styles.loading}>Preparando tu espacio…</main>;

  if (!session && !demo) return <main className={styles.page}>
    <section className={styles.card}>
      <div className={styles.brand}><b>F</b><span><strong>FincaFlow</strong><small>Gestión de comunidades</small></span></div>
      <div className={styles.intro}><p>ACCESO PROFESIONAL</p><h1>Bienvenido de nuevo</h1><span>Gestiona todas tus comunidades desde un único lugar.</span></div>
      <form onSubmit={submit}>
        <label>Correo electrónico<input name="email" type="email" autoComplete="email" required placeholder="nombre@empresa.com"/></label>
        <label>Contraseña<input name="password" type="password" autoComplete="current-password" required placeholder="••••••••"/></label>
        {error && <p className={styles.error} role="alert">{error}</p>}
        <button className={styles.primary} disabled={busy}>{busy ? "Accediendo…" : "Iniciar sesión"}</button>
      </form>
      <div className={styles.separator}><span>o</span></div>
      <button className={styles.demo} onClick={() => setDemo(true)}>Ver demostración</button>
      <small className={styles.note}>El registro público está desactivado. Las cuentas las crea el administrador.</small>
    </section>
    <aside className={styles.visual}><div><span>Multi-comunidad</span><span>Gestión centralizada</span><span>Información segura</span></div><h2>Gestión integral de comunidades</h2><p>Plataforma profesional para administradores de fincas</p></aside>
  </main>;

  return <>{children}<div className={styles.session}><span>{demo ? "Modo demostración" : session?.user.email}</span><button onClick={async () => { if (demo) setDemo(false); else { await signOut(session); setSession(null); } }}>Salir</button></div></>;
}
