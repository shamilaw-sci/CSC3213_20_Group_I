import Image from "next/image";
import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

import Navbar from "@/app/components/Navbar";
import MerchantRedirectButton from "./MerchantRedirectButton";
import RememberSelectedProduct from "./RememberSelectedProduct";

type ProductDetails = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  image: string | null;
  merchant: { name: string; logo: string | null; website: string | null };
  category: { name: string };
  images: { id: string; url: string; alt: string | null }[];
  variants: { id: string; size: string | null; color: string | null; stock: number | null }[];
};

async function getProduct(productId: string) {
  const requestHeaders = await headers();
  const host = requestHeaders.get("host");
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "http";
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? `${protocol}://${host}`;
  const response = await fetch(`${baseUrl}/api/v1/products/${productId}`, {
    cache: "no-store",
  });

  if (response.status === 404) return null;
  if (!response.ok) throw new Error("Could not load product details.");

  const data = await response.json();
  return data.product as ProductDetails;
}

export default async function ProductDetailsPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = await params;
  const product = await getProduct(productId);

  if (!product) notFound();

  const gallery = product.images.length
    ? product.images
    : [{ id: product.id, url: product.image ?? "https://placehold.co/800x1000?text=TryVora", alt: product.name }];

  return (
    <div className="tv-page min-h-screen">
      <RememberSelectedProduct productId={product.id} />
      <Navbar />
      <main className="mx-auto max-w-6xl px-6 py-8">
        <Link href="/explore" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">
          Back to Explore
        </Link>

        <section className="mt-6 grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="grid gap-4 sm:grid-cols-2">
            {gallery.map((image) => (
              <div key={image.id} className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-gray-100">
                <Image
                  src={image.url}
                  alt={image.alt ?? product.name}
                  fill
                  sizes="(min-width: 1024px) 35vw, 90vw"
                  className="object-cover"
                />
              </div>
            ))}
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">{product.category.name}</p>
            <h1 className="mt-2 text-3xl font-black text-slate-950">{product.name}</h1>
            <p className="mt-3 text-sm text-gray-500">Sold by {product.merchant.name}</p>
            <p className="mt-5 text-3xl font-black text-indigo-700">
              {product.currency} {product.price.toFixed(2)}
            </p>

            {product.description && (
              <p className="mt-6 leading-7 text-gray-600">{product.description}</p>
            )}

            <div className="mt-8">
              <h2 className="font-bold text-slate-950">Available variants</h2>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {product.variants.length ? product.variants.map((variant) => (
                  <div key={variant.id} className="rounded-xl border border-gray-200 p-4">
                    <p className="font-semibold text-gray-900">{variant.size ?? "One size"}</p>
                    <p className="text-sm text-gray-500">{variant.color ?? "Any colour"}</p>
                    <p className="mt-2 text-sm font-semibold text-indigo-700">
                      {variant.stock ?? 0} in stock
                    </p>
                  </div>
                )) : (
                  <p className="text-sm text-gray-500">No variants listed yet.</p>
                )}
              </div>
            </div>

            <MerchantRedirectButton productId={product.id} />
          </div>
        </section>
      </main>
    </div>
  );
}
