import Link from "next/link";

const groups = [
  { title: "Discover", links: [
    { label: "Explore Products", href: "/explore" },
    { label: "Latest Outfits", href: "/#latest-products" },
    { label: "How It Works", href: "/#how-it-works" },
  ] },
  { title: "Your Account", links: [
    { label: "Your Profile", href: "/profile" },
    { label: "Digital Twin", href: "/profile?tab=digitalTwin" },
    { label: "Favorites", href: "/favorites" },
    { label: "Recommendations", href: "/recommendations" },
  ] },
  { title: "Get Started", links: [
    { label: "Create an Account", href: "/register" },
    { label: "Log In", href: "/login" },
    { label: "Merchant Portal", href: "/merchant" },
    { label: "Help", href: "/#help" },
  ] },
];

export default function Footer() {
  return (
    <footer className="bg-gray-900 px-6 py-12 text-gray-300">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 md:grid-cols-4">
        <div>
          <Link href="/" className="text-2xl font-bold text-white">TryVora</Link>
          <p className="mt-4 text-sm">Discover outfits, preview your look, and continue to our partner stores to shop.</p>
        </div>
        {groups.map((group) => (
          <div key={group.title}>
            <h2 className="mb-4 font-semibold text-white">{group.title}</h2>
            <ul className="space-y-2 text-sm">
              {group.links.map((link) => <li key={link.href}><Link href={link.href} className="hover:text-white hover:underline">{link.label}</Link></li>)}
            </ul>
          </div>
        ))}
      </div>
      <div className="mt-10 border-t border-gray-700 pt-6 text-center text-sm text-gray-400">© 2026 TryVora. All rights reserved.</div>
    </footer>
  );
}
