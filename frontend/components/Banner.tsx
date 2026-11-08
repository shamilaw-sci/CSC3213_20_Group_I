import Link from "next/link";
import Image from "next/image";

export default function Banner() {
  return (
    <section className="bg-gradient-to-r from-purple-700 to-gray-300 px-6 py-16">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-10 lg:flex-row">
        <div className="flex-1">
          <h1 className="text-5xl font-semibold tracking-tight text-white sm:text-7xl">Try Clothes<br />On your body<br />Before you buy</h1>
          <p className="mt-5 max-w-xl text-lg text-white">Explore real products from partner stores, create your Digital Twin, and preview outfits before visiting the merchant to buy.</p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/explore" className="rounded-lg bg-white px-6 py-3 font-semibold text-purple-800 hover:bg-purple-50">Explore Outfits</Link>
            <Link href="/profile?tab=digitalTwin" className="rounded-lg border border-white px-6 py-3 font-semibold text-white hover:bg-purple-800">Create Your Digital Twin</Link>
          </div>
        </div>
        <div className="flex shrink-0 items-center justify-center gap-4 sm:gap-6">
          <Image src="/image 3.png" alt="Fashion outfit inspiration" width={180} height={300} priority className="h-auto w-32 rounded-xl sm:w-44" />
          <Image src="/image 2.png" alt="Another outfit to inspire your next look" width={180} height={300} priority className="h-auto w-32 rounded-xl sm:w-44" />
        </div>
      </div>
    </section>
  );
}
