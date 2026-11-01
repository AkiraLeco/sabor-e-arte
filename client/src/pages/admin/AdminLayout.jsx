import { NavLink, Navigate, Outlet, Link } from 'react-router-dom';
import { LayoutDashboard, UtensilsCrossed, Tags, ClipboardList, Settings, Inbox, LogOut, ExternalLink } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { Logo } from '../../components/ui';
import { useSeo } from '../../hooks/useSeo';

const MENU = [
  { to: '/admin', end: true, icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/pedidos', icon: ClipboardList, label: 'Pedidos' },
  { to: '/admin/produtos', icon: UtensilsCrossed, label: 'Produtos' },
  { to: '/admin/categorias', icon: Tags, label: 'Categorias' },
  { to: '/admin/mensagens', icon: Inbox, label: 'Mensagens' },
  { to: '/admin/configuracoes', icon: Settings, label: 'Configurações' },
];

export default function AdminLayout() {
  const { user, loading, logout } = useAuth();
  const { settings } = useSettings();
  useSeo({ title: 'Painel administrativo' });

  if (loading) return <div className="admin-loading">Carregando...</div>;
  if (!user) return <Navigate to="/admin/login" replace />;

  return (
    <div className="admin">
      <aside className="admin__side">
        <Link to="/admin" className="admin__brand"><Logo settings={settings} light /></Link>
        <nav aria-label="Administração">
          {MENU.map(({ to, end, icon: Icon, label }) => (
            <NavLink key={to} to={to} end={end}><Icon size={18} aria-hidden="true" /> <span>{label}</span></NavLink>
          ))}
        </nav>
        <div className="admin__side-foot">
          <Link to="/" target="_blank"><ExternalLink size={16} /> Ver site</Link>
          <button onClick={logout}><LogOut size={16} /> Sair</button>
          <small>{user.email}</small>
        </div>
      </aside>
      <main className="admin__main" id="conteudo">
        <Outlet />
      </main>
    </div>
  );
}
