import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, Heart, Ruler, Shirt, Sparkles } from "lucide-react";

import Navbar from "@/app/components/Navbar";
import { getCurrentSession } from "@/server/auth/session";
import { loadCustomerOverview } from "@/server/dashboard/load-customer-overview";

export default async function CustomerDashboardPage() {
  const current = await getCurrentSession();
  if (!current) redirect("/login?returnTo=%2Fdashboard");
  if (current.user.role === "ADMIN") redirect("/admin");
  if (current.user.role === "MERCHANT") redirect("/merchant");

  const overview = await loadCustomerOverview(current.user.id);

  return (
    <div className="tv-page min-h-screen bg-slate-50">
      <Navbar />
      <main className="mx-auto max-w-7xl px-5 py-8 sm:px-6 lg:py-10 lg:pl-80">
        <div className="mb-8">
          <p className="text-sm font-bold uppercase tracking-widest text-indigo-600">Your space</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-950">Welcome, {current.user.name}</h1>
          <p className="mt-2 text-slate-600">Your profile, saved products, and fitting previews in one place.</p>
        </div>

        <div className="min-w-0 space-y-6">
            <section aria-labelledby="overview-heading">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h2 id="overview-heading" className="text-xl font-bold text-slate-950">Overview</h2>
                <Link href="/explore" className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-700 hover:underline">
                  Explore products <ArrowRight size={16} aria-hidden="true" />
                </Link>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <DashboardCard
                  title="Digital Twin"
                  detail={overview.digitalTwinCreatedAt ? "Photo ready for your fitting room" : "No Digital Twin photo yet"}
                  action="Manage Digital Twin"
                  href="/profile?tab=digitalTwin"
                  icon={<Shirt size={20} aria-hidden="true" />}
                />
                <DashboardCard
                  title="My Measurements"
                  detail={overview.savedMeasurementCount > 0
                    ? `${overview.savedMeasurementCount} of 6 measurements saved`
                    : "No measurements saved yet"}
                  action="Manage measurements"
                  href="/profile?tab=measurements"
                  icon={<Ruler size={20} aria-hidden="true" />}
                />
                <DashboardCard
                  title="My Favorites"
                  detail={`${overview.favoritesCount} saved ${overview.favoritesCount === 1 ? "product" : "products"}`}
                  action="View favorites"
                  href="/favorites"
                  icon={<Heart size={20} aria-hidden="true" />}
                />
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6" aria-labelledby="recommendations-heading">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="mb-3 inline-flex rounded-xl bg-violet-100 p-2 text-violet-700"><Sparkles size={20} aria-hidden="true" /></div>
                  <h2 id="recommendations-heading" className="text-lg font-bold text-slate-950">Recommended For You</h2>
                  <p className="mt-1 text-sm text-slate-600">
                    {overview.savedMeasurementCount > 0
                      ? "Explore picks that use your available measurements and product interests."
                      : "Add measurements for size-based suggestions, or browse available products now."}
                  </p>
                </div>
                <Link href="/recommendations" className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                  Open For You <ArrowRight size={16} aria-hidden="true" />
                </Link>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6" aria-labelledby="tryons-heading">
              <h2 id="tryons-heading" className="text-lg font-bold text-slate-950">Recent fitting previews</h2>
              <p className="mt-1 text-sm text-slate-600">Saved illustrative Try-On sessions, not generated outfit photos.</p>
              {overview.recentTryOns.length === 0 ? (
                <div className="mt-5 rounded-xl bg-slate-50 px-4 py-5 text-sm text-slate-600">
                  No fitting previews saved yet. <Link href="/explore" className="font-semibold text-indigo-700 underline">Explore products</Link> to try an outfit.
                </div>
              ) : (
                <ul className="mt-5 divide-y divide-slate-100">
                  {overview.recentTryOns.map((tryOn) => (
                    <li key={tryOn.tryOnSessionId} className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                      <div>
                        <p className="font-semibold text-slate-900">{tryOn.product.productName}</p>
                        <p className="text-sm text-slate-500">
                          {new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(tryOn.createdAt)} · {tryOn.status.toLowerCase()}
                        </p>
                      </div>
                      <Link href={`/products/${tryOn.product.productId}`} className="text-sm font-semibold text-indigo-700 hover:underline">
                        View product
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {!overview.hasProfile && (
              <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                Your profile is not set up yet. <Link href="/profile" className="font-semibold underline">Open Profile</Link> to get started.
              </p>
            )}
        </div>
      </main>
    </div>
  );
}

function DashboardCard({ title, detail, action, href, icon }: {
  title: string;
  detail: string;
  action: string;
  href: string;
  icon: React.ReactNode;
}) {
  return (
    <article className="flex min-h-48 flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 inline-flex w-fit rounded-xl bg-indigo-50 p-2.5 text-indigo-700">{icon}</div>
      <h3 className="font-bold text-slate-950">{title}</h3>
      <p className="mt-1 flex-1 text-sm text-slate-600">{detail}</p>
      <Link href={href} className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-700 hover:underline">
        {action} <ArrowRight size={15} aria-hidden="true" />
      </Link>
    </article>
  );
}
