import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  Settings2,
  FlaskConical,
} from 'lucide-react';

const navItems = [
  { to: '/', label: 'Tableau de bord', icon: LayoutDashboard },
  { to: '/projects', label: 'Projets', icon: FolderKanban },
  { to: '/settings/pipeline', label: 'Paramétrage Pipeline', icon: Settings2 },
];

export function AppLayout({ children }: { children: ReactNode }) {
  const location = useLocation();

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-sidebar border-r border-sidebar-border">
        <div className="p-6">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-sidebar-primary flex items-center justify-center">
              <FlaskConical className="h-5 w-5 text-sidebar-primary-foreground" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-sidebar-foreground tracking-tight">Product</h1>
              <p className="text-xs text-sidebar-muted">Validation</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = item.to === '/' ? location.pathname === '/' : location.pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 mx-3 mb-4 rounded-lg bg-sidebar-accent/50">
          <p className="text-xs text-sidebar-foreground/60">Version</p>
          <p className="text-xs font-mono text-sidebar-primary">v1.0.0-beta</p>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-sidebar border-b border-sidebar-border px-4 py-3 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center">
          <FlaskConical className="h-4 w-4 text-sidebar-primary-foreground" />
        </div>
        <span className="text-sm font-bold text-sidebar-foreground">Product Validation</span>
      </div>

      {/* Main content */}
      <main className="flex-1 lg:ml-0 mt-14 lg:mt-0 overflow-auto">
        {children}
      </main>
    </div>
  );
}
