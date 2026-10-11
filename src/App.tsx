import { AuthGate, useSession } from '@/components/auth-gate';
import { useEffect, useState } from 'react';
import { getMembers } from '@/lib/cloud-messages';
import { Dashboard } from '@/components/dashboard';
import { PrivateMessages } from '@/components/private-messages';

export default function App() {
  return (
    <AuthGate>
      <Workspace />
    </AuthGate>
  );
}

function Workspace() {
  const session = useSession();
  const portal = new URLSearchParams(window.location.search).get('portal') === 'propietario';
  const [owner, setOwner] = useState(false);
  const [checking, setChecking] = useState(!!session);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let alive = true;
    if (!session || portal) { setChecking(false); return; }
    setChecking(true); setError(false);
    getMembers(session).then(rows => { if (alive) setOwner(rows.some(m => m.role === 'owner')); })
      .catch(() => { if (alive) setError(true); })
      .finally(() => { if (alive) setChecking(false); });
    return () => { alive = false; };
  }, [session, portal, attempt]);
  if (checking) return <p role="status">Comprobando tu acceso…</p>;
  if (error) return <div style={{ padding: 24 }}><p role="alert">No se pudo comprobar tu acceso. Comprueba la conexión y la configuración de mensajería.</p><button onClick={() => setAttempt(attempt + 1)}>Reintentar</button></div>;
  return portal || owner
    ? <div style={{ maxWidth: 1000, margin: '0 auto', padding: '24px 20px 100px' }}><PrivateMessages portal /></div>
    : <Dashboard />;
}
