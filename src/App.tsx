import { AuthGate } from '@/components/auth-gate';
import { Dashboard } from '@/components/dashboard';

export default function App() {
  return (
    <AuthGate>
      <Dashboard />
    </AuthGate>
  );
}
