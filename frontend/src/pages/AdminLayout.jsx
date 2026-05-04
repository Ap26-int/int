import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LogOut, Inbox, Sparkles, Home } from "lucide-react";

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const loc = useLocation();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [loc.pathname]);

  const tabs = [
    { to: "/admin/leads", label: "Leads", icon: Inbox, testid: "tab-leads" },
    { to: "/admin/social", label: "Social", icon: Sparkles, testid: "tab-social" },
  ];

  return (
    <div className="min-h-screen bg-[hsl(var(--obsidian))] text-[hsl(var(--ivory))]">
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-[hsl(var(--obsidian)/0.85)] border-b border-[hsl(var(--gold)/0.18)]">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-5 lg:px-10 py-4">
          <Link to="/admin" className="flex items-center gap-3">
            <img src="/lumiere-logo.png" alt="Lumière" className="h-10 w-auto" />
            <span className="text-[hsl(var(--gold))] text-[10px] tracking-luxury uppercase hidden sm:inline">
              Studio Admin
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {tabs.map((t) => (
              <NavLink
                key={t.to}
                to={t.to}
                data-testid={t.testid}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 text-[11px] tracking-elegant uppercase transition-colors ${
                    isActive
                      ? "bg-[hsl(var(--gold))] text-[hsl(var(--obsidian))]"
                      : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--gold))]"
                  }`
                }
              >
                <t.icon size={13} strokeWidth={1.4} />
                {t.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="hidden sm:inline-flex items-center gap-1.5 text-[10px] tracking-elegant uppercase text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--gold))]"
              data-testid="admin-view-site"
            >
              <Home size={12} strokeWidth={1.4} /> View Site
            </Link>
            <span className="hidden lg:inline text-[hsl(var(--muted-foreground))] text-xs">
              {user?.email}
            </span>
            <button
              data-testid="admin-logout"
              onClick={logout}
              className="flex items-center gap-1.5 px-3 py-2 border border-[hsl(var(--border))] text-[10px] tracking-elegant uppercase text-[hsl(var(--ivory))] hover:border-[hsl(var(--gold))] hover:text-[hsl(var(--gold))] transition-colors"
            >
              <LogOut size={12} strokeWidth={1.4} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
        {/* Mobile tabs */}
        <div className="md:hidden flex border-t border-[hsl(var(--border))]">
          {tabs.map((t) => (
            <NavLink
              key={t.to}
              to={t.to}
              className={({ isActive }) =>
                `flex-1 text-center py-3 text-[10px] tracking-luxury uppercase transition-colors ${
                  isActive
                    ? "text-[hsl(var(--gold))] border-b-2 border-[hsl(var(--gold))]"
                    : "text-[hsl(var(--muted-foreground))]"
                }`
              }
            >
              {t.label}
            </NavLink>
          ))}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-5 lg:px-10 py-10 lg:py-14">
        <Outlet />
      </main>
    </div>
  );
}
