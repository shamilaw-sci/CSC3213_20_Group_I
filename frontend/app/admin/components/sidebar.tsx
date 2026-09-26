import Link from "next/link";

const links = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/merchants", label: "Merchants" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/audit-logs", label: "Audit logs" },
];

export default function Sidebar() {
  return (
    <aside className="min-h-screen w-64 bg-slate-950 px-5 py-6 text-white">
      <Link href="/admin" className="text-xl font-black tracking-tight">
        TryVora Admin
      </Link>
      <nav className="mt-8 grid gap-2">
        {links.map((link) => (
          <Link key={link.href} href={link.href} className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-200 hover:bg-white/10 hover:text-white">
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
