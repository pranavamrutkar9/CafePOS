"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import api from "@/api/axios";
import {
  LogOut,
  UserCircle,
} from "lucide-react";
import { MENU_ITEMS } from "@/components/SharedMenu";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user } = useAuth();
  const [sessionOpen, setSessionOpen] = useState<boolean | null>(null);

  useEffect(() => {
    api.get("/sessions/current")
      .then((res) => setSessionOpen(res.data?.status === "OPEN"))
      .catch(() => setSessionOpen(false));
  }, []);

  return (
    <div className="min-h-screen flex" style={{ background: "var(--bg-page)" }}>
      {/* ── Sidebar ──────────────────────────────────────────── */}
      <aside
        className="flex flex-col z-20 relative shrink-0"
        style={{
          width: "var(--sidebar-width)",
          background: "var(--espresso-900)",
          minHeight: "100vh",
        }}
      >
        {/* Logo */}
        <div
          className="flex items-center gap-3 px-5"
          style={{
            height: "var(--topbar-height)",
            borderBottom: "1px solid var(--espresso-700)",
          }}
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-base shrink-0"
            style={{
              background: "var(--accent-500)",
              color: "var(--espresso-900)",
              fontFamily: "var(--font-display)",
            }}
          >
            ☕
          </div>
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: "var(--text-lg)",
              color: "var(--text-on-dark)",
            }}
          >
            Cafe POS
          </span>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 overflow-y-auto py-3 organic-scrollbar">
          <ul className="space-y-0.5 px-3">
            {MENU_ITEMS.map((item) => {
              const isActive =
                item.href === "/kds"
                  ? pathname === "/kds"
                  : pathname.startsWith(item.href);
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="flex items-center gap-3 px-3 rounded-lg transition-all duration-150"
                    style={{
                      height: "40px",
                      fontSize: "var(--text-sm)",
                      fontFamily: "var(--font-sans)",
                      fontWeight: 500,
                      color: isActive
                        ? "var(--accent-500)"
                        : "var(--text-on-dark-muted)",
                      background: isActive
                        ? "var(--espresso-800)"
                        : "transparent",
                      borderLeft: isActive
                        ? "3px solid var(--accent-500)"
                        : "3px solid transparent",
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        (e.currentTarget as HTMLElement).style.background =
                          "var(--espresso-800)";
                        (e.currentTarget as HTMLElement).style.color =
                          "var(--text-on-dark)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        (e.currentTarget as HTMLElement).style.background =
                          "transparent";
                        (e.currentTarget as HTMLElement).style.color =
                          "var(--text-on-dark-muted)";
                      }
                    }}
                  >
                    <item.icon
                      size={18}
                      style={{
                        color: isActive
                          ? "var(--accent-500)"
                          : "var(--text-on-dark-muted)",
                        flexShrink: 0,
                      }}
                    />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Log Out */}
        <div
          className="p-3"
          style={{ borderTop: "1px solid var(--espresso-700)" }}
        >
          <Link
            href="/session"
            className="flex items-center gap-3 px-3 rounded-lg transition-all duration-150"
            style={{
              height: "40px",
              fontSize: "var(--text-sm)",
              fontFamily: "var(--font-sans)",
              fontWeight: 500,
              color: "var(--text-on-dark-muted)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background =
                "var(--espresso-800)";
              (e.currentTarget as HTMLElement).style.color =
                "var(--status-danger)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "transparent";
              (e.currentTarget as HTMLElement).style.color =
                "var(--text-on-dark-muted)";
            }}
          >
            <LogOut size={18} style={{ flexShrink: 0 }} />
            Exit Dashboard
          </Link>
        </div>
      </aside>

      {/* ── Main Content ─────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header
          className="flex items-center justify-between px-8 shrink-0"
          style={{
            height: "var(--topbar-height)",
            background: "var(--bg-surface)",
            borderBottom: "1px solid var(--border)",
          }}
        >
          {/* Page title injected by children via <title> or we show route */}
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: "var(--text-xl)",
              color: "var(--text-primary)",
            }}
          >
            {MENU_ITEMS.find(
              (i) => i.href !== "/kds" && pathname.startsWith(i.href)
            )?.name ?? "Dashboard"}
          </h1>

          <div className="flex items-center gap-4">
            {/* Session indicator */}
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-full"
              style={{
                background: "var(--bg-subtle)",
                border: "1px solid var(--border)",
              }}
            >
              <span
                className="rounded-full shrink-0"
                style={{
                  width: 8,
                  height: 8,
                  background:
                    sessionOpen === null
                      ? "var(--status-neutral)"
                      : sessionOpen
                      ? "var(--status-success)"
                      : "var(--status-neutral)",
                }}
              />
              <span
                style={{
                  fontSize: "var(--text-sm)",
                  color: "var(--text-secondary)",
                  fontFamily: "var(--font-sans)",
                }}
              >
                {sessionOpen === null
                  ? "Checking…"
                  : sessionOpen
                  ? "Session Open"
                  : "No Session"}
              </span>
            </div>

            <div style={{ width: 1, height: 24, background: "var(--border)" }} />

            {/* Employee name */}
            <div className="flex items-center gap-2">
              <div className="text-right hidden md:block">
                <p
                  style={{
                    fontSize: "var(--text-sm)",
                    fontWeight: 600,
                    color: "var(--text-primary)",
                    lineHeight: 1.2,
                  }}
                >
                  {user?.name ?? "Employee"}
                </p>
                <p
                  style={{
                    fontSize: "var(--text-xs)",
                    color: "var(--text-tertiary)",
                  }}
                >
                  {user?.role ?? ""}
                </p>
              </div>
              <UserCircle
                size={32}
                style={{ color: "var(--text-tertiary)" }}
              />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main
          className="flex-1 overflow-y-auto p-8 organic-scrollbar"
          style={{ background: "var(--bg-page)" }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
