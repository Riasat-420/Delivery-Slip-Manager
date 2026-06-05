'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

interface SidebarProps {
  user: { username: string; role: string };
}

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  }

  const navItems = [
    { href: '/delivery-slips', label: 'Delivery Slips', icon: '≡' },
    { href: '/tax-invoice', label: 'Tax Invoice', icon: '◇' },
    ...(user.role === 'admin' ? [{ href: '/management', label: 'Management', icon: '◈' }] : []),
  ];

  return (
    <aside style={{
      width: 260,
      background: 'white',
      borderRight: '1px solid #e5e7eb',
      position: 'fixed',
      top: 0,
      left: 0,
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 100,
      boxShadow: '2px 0 8px rgba(0,0,0,0.06)',
    }}>
      {/* Logo */}
      <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid #f3f4f6' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 44, height: 44, background: '#fff7ed', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #fed7aa' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L20 7V17L12 22L4 17V7L12 2Z" fill="#f97316" opacity="0.3"/>
              <path d="M12 2L20 7V17L12 22L4 17V7L12 2Z" stroke="#f97316" strokeWidth="1.5"/>
              <circle cx="12" cy="12" r="3" fill="#f97316"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#f97316', lineHeight: 1.2, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Old City</div>
            <div style={{ fontSize: 10, color: '#64748b', lineHeight: 1.2 }}>Sand Washing L.L.C</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 12px' }}>
        {navItems.map(item => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 14px',
                borderRadius: 8,
                marginBottom: 4,
                textDecoration: 'none',
                background: isActive ? '#fff7ed' : 'transparent',
                color: isActive ? '#f97316' : '#6b7280',
                fontWeight: isActive ? 600 : 500,
                fontSize: 14,
                borderLeft: isActive ? '3px solid #f97316' : '3px solid transparent',
                transition: 'all 0.15s',
              }}
            >
              <span style={{ fontSize: 16 }}>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div style={{ padding: '16px 12px', borderTop: '1px solid #f3f4f6' }}>
        <div style={{ padding: '8px 14px', background: '#f8f9fa', borderRadius: 8, marginBottom: 10, fontSize: 12, color: '#6b7280' }}>
          <span style={{ fontWeight: 600, color: '#374151' }}>{user.username}</span>
          <span style={{ marginLeft: 6, background: '#f97316', color: 'white', padding: '1px 6px', borderRadius: 10, fontSize: 10 }}>{user.role}</span>
        </div>
        <button
          onClick={handleLogout}
          style={{ width: '100%', padding: '10px', background: '#ef4444', color: 'white', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
        >
          Logout
        </button>
      </div>
    </aside>
  );
}
