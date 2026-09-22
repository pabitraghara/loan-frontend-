"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAdminAuth } from "./AdminAuth";

const NAV = [
  { href: "/admin", label: "Dashboard", exact: true },
  { href: "/admin/applications", label: "Applications" },
  {
    href: "/admin/access-logs",
    label: "Access logs",
    roles: ["compliance", "admin"],
  },
];

const ROLE_LABELS: Record<string, string> = {
  agent: "Agent",
  closer: "Closer",
  verification: "Verification agent",
  underwriter: "Underwriter",
  compliance: "Compliance",
  admin: "Administrator",
};

export function AdminShell({ children }: { children: React.ReactNode }) {
  const { user, ready, logout } = useAdminAuth();
  const pathname = usePathname();

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <p className="text-sm text-slate-500">Loading...</p>
      </div>
    );
  }

  // The login page renders on its own, without the shell.
  if (!user) return <>{children}</>;

  const visible = NAV.filter((n) => !n.roles || n.roles.includes(user.role));

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-800 bg-brand-900">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-6">
            <Link
              href="/admin"
              className="flex items-center gap-2 text-sm font-bold text-white"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded bg-white/15 text-xs">
                R
              </span>
              NewAdmin
            </Link>
            <nav aria-label="Admin" className="hidden gap-1 sm:flex">
              {visible.map((item) => {
                const active = item.exact
                  ? pathname === item.href
                  : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={[
                      "rounded-md px-3 py-1.5 text-sm font-medium transition",
                      active
                        ? "bg-white/15 text-white"
                        : "text-brand-100 hover:bg-white/10",
                    ].join(" ")}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-xs font-medium text-white">{user.fullName}</p>
              <p className="text-[11px] text-brand-200">
                {ROLE_LABELS[user.role] ?? user.role}
              </p>
            </div>
            <button
              type="button"
              onClick={logout}
              className="rounded-md border border-white/25 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-white/10"
            >
              Sign out
            </button>
          </div>
        </div>

        <nav
          aria-label="Admin mobile"
          className="flex gap-1 border-t border-white/10 px-4 py-2 sm:hidden"
        >
          {visible.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-1.5 text-xs font-medium text-brand-100 hover:bg-white/10"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">{children}</div>
    </div>
  );
}
