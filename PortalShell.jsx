import { NavLink, Link, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { Brand } from './SiteLayout.jsx';
import { useAuth } from '../contexts/DemoContext.jsx';

export default function PortalShell({ role, navigation, children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function signOut() {
    logout();
    const loginPath = role === 'Customer' ? '/customer-login'
      : role === 'Doctor' ? '/staff-login?role=Doctor' : '/staff-login?role=Admin';
    navigate(loginPath, { replace: true });
  }

  return (
    <div className="portal-shell">
      <aside className="portal-sidebar">
        <Brand />
        <small className="portal-sidebar-label">{role} WORKSPACE</small>
        <nav aria-label={`${role} navigation`}>
          {navigation.map(({ label, to, icon: Icon }) => (
            <NavLink key={to} to={to} className={({ isActive }) => isActive ? 'active' : ''}>
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <button className="portal-logout" onClick={signOut}>
          <LogOut size={17} /> <span>Sign out</span>
        </button>
      </aside>
      <main className="portal-main">
        <header className="portal-topbar">
          <div>
            <Link className="portal-home-link" to="/">← Home</Link>
            <span className="portal-topbar-separator">/</span>
            <b>{role} portal</b>
          </div>
          <div className="portal-user">
            <span className="portal-avatar">{user?.name?.slice(0, 1) || role.slice(0, 1)}</span>
            <span><b>{user?.name}</b><small>{role}</small></span>
          </div>
        </header>
        <div className="portal-content">{children}</div>
      </main>
    </div>
  );
}
