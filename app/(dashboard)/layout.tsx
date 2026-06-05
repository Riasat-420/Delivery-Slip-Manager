import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import Sidebar from '@/components/Sidebar';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect('/login');

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar user={session as any} />
      <main style={{ flex: 1, marginLeft: 260, padding: '0', background: '#f8f9fa', minHeight: '100vh' }}>
        <div style={{ borderBottom: '3px solid #f97316', background: 'white', padding: '16px 28px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1a1a2e' }}>Slip Control</h2>
        </div>
        <div style={{ padding: '28px' }}>
          {children}
        </div>
      </main>
    </div>
  );
}
