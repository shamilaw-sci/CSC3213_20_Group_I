"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, LayoutDashboard, Menu, MessageSquareText, MessageSquareWarning, PackageCheck, ScanLine, ShieldCheck, ShoppingBag, Store, UserRoundCog, UsersRound, WandSparkles } from "lucide-react";
import { useState } from "react";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/users", label: "User management", icon: UsersRound },
  { href: "/admin/catalog", label: "Catalog", icon: ShoppingBag },
  { href: "/admin/products", label: "Product approvals", icon: PackageCheck },
  { href: "/admin/merchants", label: "Merchants", icon: Store },
  { href: "/admin/twins", label: "Digital twin monitor", icon: ScanLine },
  { href: "/admin/try-ons", label: "Try-on management", icon: WandSparkles },
  { href: "/admin/support", label: "Support tickets", icon: MessageSquareText },
  { href: "/admin/feedback", label: "Feedback management", icon: MessageSquareWarning },
  { href: "/admin/security", label: "Security", icon: ShieldCheck },
  { href: "/adminprofile", label: "Admin profile", icon: UserRoundCog },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <aside className={`sticky top-0 h-screen shrink-0 bg-[#faf1ff] p-3 text-slate-800 shadow-sm transition-[width] duration-300 ${collapsed ? "w-[72px]" : "w-[240px]"}`}>
      <div className={`mb-7 flex items-center ${collapsed ? "justify-center" : "justify-between"}`}>
        {!collapsed && <Link href="/admin" className="px-2 text-lg font-black tracking-tight text-purple-950">TryVora Admin</Link>}
        <button type="button" onClick={() => setCollapsed((value) => !value)} aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"} aria-expanded={!collapsed} title={collapsed ? "Expand sidebar" : "Collapse sidebar"} className="rounded-lg p-2 hover:bg-purple-200 focus-visible:outline-2 focus-visible:outline-purple-700">
          <Menu size={22} />
        </button>
      </div>
      <nav aria-label="Admin navigation" className="flex flex-col gap-2">
        {links.map(({ href, label, icon: Icon }) => {
          const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
          return (
            <Link key={href} href={href} title={collapsed ? label : undefined} aria-current={active ? "page" : undefined} className={`flex min-h-12 items-center rounded-xl px-3 transition-colors ${collapsed ? "justify-center" : "gap-3"} ${active ? "bg-purple-200 font-bold text-purple-950 shadow-sm" : "text-slate-700 hover:bg-pink-100 hover:text-pink-950"}`}>
              <Icon size={20} className="shrink-0" />
              {!collapsed && <span className="truncate text-sm">{label}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
