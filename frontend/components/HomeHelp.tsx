import Link from "next/link";

export default function HomeHelp() {
  return (
    <section id="help" aria-labelledby="help-title" className="scroll-mt-28 bg-white px-6 py-16">
      <div className="mx-auto max-w-3xl">
        <h2 id="help-title" className="mb-8 text-3xl font-bold text-gray-950">Need a hand?</h2>
        <div className="space-y-4 text-gray-700">
          <details className="rounded-xl border border-gray-200 p-5">
            <summary className="cursor-pointer font-semibold">How do I start a virtual try-on?</summary>
            <p className="mt-3">Open <Link href="/explore" className="text-indigo-700 underline">Explore</Link>, choose a product, and select Try On. Add your measurements and Digital Twin in your <Link href="/profile?tab=digitalTwin" className="text-indigo-700 underline">profile</Link> to set up your preview.</p>
          </details>
          <details className="rounded-xl border border-gray-200 p-5">
            <summary className="cursor-pointer font-semibold">Do I need an account?</summary>
            <p className="mt-3">You can browse products without an account. <Link href="/register" className="text-indigo-700 underline">Create an account</Link> or <Link href="/login" className="text-indigo-700 underline">log in</Link> to save favorites, manage your profile, and save try-on history.</p>
          </details>
          <details className="rounded-xl border border-gray-200 p-5">
            <summary className="cursor-pointer font-semibold">Where do I buy a product?</summary>
            <p className="mt-3">Open a product to view its details and visit the merchant store to complete your purchase. TryVora does not process payments.</p>
          </details>
        </div>
      </div>
    </section>
  );
}
