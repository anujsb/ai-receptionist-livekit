"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  PhoneCall,
  CalendarDays,
  Mic,
  Settings,
  Activity,
} from "lucide-react";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/demo", label: "Live Demo", icon: Mic },
  { href: "/calls", label: "Calls", icon: PhoneCall },
  { href: "/appointments", label: "Appointments", icon: CalendarDays },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex bg-[#fafaf8] min-h-screen" style={{ fontFamily: "'Instrument Sans', 'DM Sans', sans-serif" }}>
      {/* Sidebar */}
      <aside className="relative flex flex-col bg-white border-stone-200/80 border-r w-60 shrink-0">
        {/* Grain texture */}
        <div className="absolute inset-0 opacity-[0.025] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundSize: "120px",
          }}
        />

        {/* Logo */}
        <div className="relative px-6 py-6 border-stone-100 border-b">
          <div className="flex items-center gap-2.5">
            <div className="flex justify-center items-center bg-stone-900 rounded-lg w-7 h-7">
              <Activity size={14} className="text-white" />
            </div>
            <span className="font-semibold text-stone-900 tracking-tight">Receptra</span>
          </div>
          <p className="mt-0.5 ml-9 text-[11px] text-stone-400">AI Clinic Receptionist</p>
        </div>

        {/* Nav */}
        <nav className="relative flex flex-col flex-1 gap-0.5 px-3 py-4">
          {nav.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                  active
                    ? "bg-stone-900 text-white font-medium"
                    : "text-stone-500 hover:text-stone-900 hover:bg-stone-100"
                }`}
              >
                <Icon size={16} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="relative px-6 py-4 border-stone-100 border-t">
          <div className="flex items-center gap-2.5">
            <div className="flex justify-center items-center bg-stone-100 rounded-full w-7 h-7 font-medium text-stone-600 text-xs">
              DR
            </div>
            <div>
              <p className="font-medium text-stone-700 text-xs">Dr. Sharma</p>
              <p className="text-[11px] text-stone-400">Admin</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="relative flex-1 overflow-auto">
        {/* Subtle grain on main content area */}
        <div className="fixed inset-0 opacity-[0.018] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundSize: "128px",
          }}
        />
        {children}
      </main>
    </div>
  );
}