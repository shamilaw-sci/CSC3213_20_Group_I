import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Footer from "@/components/Footer";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "About Us | Universal Virtual Fitting Room",
  description: "Learn about Universal Virtual Fitting Room and our connected fashion discovery experience.",
};

const offerings = [
  {
    title: "Explore Multiple Merchants",
    description: "Discover clothing collections from different fashion merchants through one unified platform.",
  },
  {
    title: "AI-Powered Virtual Try-On",
    description: "Use our AI-powered technology to generate a visual preview of yourself wearing selected garments, helping you explore different styles and outfits.",
  },
  {
    title: "Digital Twin",
    description: "Create a personalized Digital Twin using your photographs and body measurements to support a more personalized virtual fitting experience.",
  },
  {
    title: "Compare Products",
    description: "Explore and compare garments from different merchants based on available details such as prices, styles, colours, brands, and sizes.",
  },
  {
    title: "Connect Directly with Merchants",
    description: "Once you find something you like, visit the respective merchant’s website or product page to learn more and proceed with your purchase.",
  },
];

const highlights: { title: string; image: string; alt: string; description: string; fit?: "contain" | "cover" }[] = [
  {
    title: "Discover",
    image: "/clothes.jpg",
    alt: "A range of colourful clothing on a retail rack",
    description: "Explore fashion collections from multiple merchants in one place.",
  },
  {
    title: "Personalize",
    image: "/images/digitalTwin/twin1.jpg",
    alt: "Example portrait used to illustrate a Digital Twin profile",
    description: "Set up a Digital Twin with your photo and measurements for a more personal experience.",
  },
  {
    title: "Virtual Fitting",
    image: "/images/about/virtualfiton1.png",
    alt: "Virtual fitting kiosk displaying a generated outfit preview in a fashion store",
    description: "Explore an AI-generated visual preview of a selected garment on a digital display.",
    fit: "contain",
  },
  {
    title: "Explore Garments",
    image: "/images/about/virtualfiton2.png",
    alt: "Digital mannequin surrounded by several garment options",
    description: "Consider different clothing options as you browse and compare styles.",
    fit: "contain",
  },
];

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="bg-gray-50 px-6 py-12 sm:py-16">
        <div className="mx-auto max-w-6xl">
          <section className="grid overflow-hidden rounded-3xl bg-gradient-to-br from-purple-700 via-fuchsia-600 to-blue-600 text-white shadow-lg lg:grid-cols-[1.1fr_0.9fr]">
            <div className="px-6 py-12 sm:px-12 sm:py-16">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/80">About Us</p>
              <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">Discover Fashion. Explore Possibilities. Experience Virtual Fitting.</h1>
              <p className="mt-6 max-w-3xl text-lg leading-8 text-white/90">
                Welcome to <strong>Universal Virtual Fitting Room</strong>, a platform designed to make discovering and exploring fashion easier, smarter, and more interactive.
              </p>
              <p className="mt-4 max-w-3xl leading-7 text-white/90">
                We bring multiple fashion merchants together in one place, allowing customers to explore clothing collections from different stores, compare products, and experience AI-powered virtual try-on before visiting the merchant’s store or website.
              </p>
              <p className="mt-4 max-w-3xl leading-7 text-white/90">
                Our goal is to bridge the gap between online fashion discovery and the personal experience of trying on clothes.
              </p>
            </div>
            <div className="relative min-h-64 lg:min-h-full">
              <Image
                src="/clothes.jpg"
                alt="Colourful clothing displayed together on a retail rack"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-purple-950/35 via-transparent to-transparent lg:bg-gradient-to-r lg:from-purple-700/30 lg:to-transparent" />
            </div>
          </section>

          <section className="mt-10 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-200 sm:p-10">
            <h2 className="text-2xl font-bold text-gray-900">Our Story</h2>
            <div className="mt-4 max-w-4xl space-y-4 leading-7 text-gray-700">
              <p>Choosing the right outfit online can be challenging. Customers often need to visit multiple websites to explore different collections, compare prices, and find styles that suit them. Additionally, not being able to visualize how a garment might look when worn can make purchasing decisions difficult.</p>
              <p>We developed Universal Virtual Fitting Room to address these challenges by bringing fashion discovery, product comparison, and AI-powered virtual fitting together in one convenient platform.</p>
              <p>Rather than operating as another online shopping store, we aim to connect customers with multiple fashion merchants while allowing each merchant to maintain their own business and handle their purchases independently.</p>
            </div>
          </section>

          <section className="mt-10">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-fuchsia-700">From browsing to virtual fitting</p>
              <h2 className="mt-2 text-2xl font-bold text-gray-900">Explore fashion in a few steps</h2>
              <p className="mt-3 leading-7 text-gray-700">Discover collections, personalize your experience with a Digital Twin, and use a generated preview as another way to explore an outfit.</p>
            </div>
            <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {highlights.map((highlight) => (
                <article key={highlight.title} className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200">
                  <div className="relative h-56 bg-gray-100">
                    <Image src={highlight.image} alt={highlight.alt} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" className={highlight.fit === "contain" ? "object-contain" : "object-cover"} />
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-semibold text-gray-900">{highlight.title}</h3>
                    <p className="mt-2 leading-7 text-gray-700">{highlight.description}</p>
                  </div>
                </article>
              ))}
            </div>
            <p className="mt-3 text-sm text-gray-500">Virtual try-on images are visual previews and may differ from how a garment looks or fits in real life.</p>
          </section>

          <section className="mt-10">
            <h2 className="text-2xl font-bold text-gray-900">What We Offer</h2>
            <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {offerings.map((offering) => (
                <article key={offering.title} className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">{offering.title}</h3>
                  <p className="mt-3 leading-7 text-gray-700">{offering.description}</p>
                </article>
              ))}
            </div>
          </section>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-200 sm:p-8">
              <h2 className="text-2xl font-bold text-gray-900">Our Mission</h2>
              <p className="mt-4 leading-7 text-gray-700">Our mission is to simplify fashion discovery by connecting customers with diverse fashion merchants and making clothing exploration more interactive through AI-powered virtual fitting technology.</p>
              <p className="mt-4 leading-7 text-gray-700">We aim to create a convenient environment where customers can discover more choices, explore different styles, and make more informed fashion decisions.</p>
            </section>
            <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-200 sm:p-8">
              <h2 className="text-2xl font-bold text-gray-900">Our Vision</h2>
              <p className="mt-4 leading-7 text-gray-700">To become a connected fashion discovery platform that brings customers and fashion merchants together through technology, accessibility, and innovation.</p>
              <p className="mt-4 leading-7 text-gray-700">We envision a future where exploring fashion is not limited by individual store boundaries, but becomes a seamless experience across multiple merchants.</p>
            </section>
          </div>

          <section className="mt-10 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-200 sm:p-10">
            <h2 className="text-2xl font-bold text-gray-900">Connecting Customers and Merchants</h2>
            <p className="mt-4 leading-7 text-gray-700">We believe that technology should create opportunities for both customers and businesses.</p>
            <p className="mt-4 leading-7 text-gray-700">For customers, our platform provides a convenient way to discover, compare, and virtually explore fashion from multiple merchants.</p>
            <p className="mt-4 leading-7 text-gray-700">For merchants, it offers an additional opportunity to showcase their collections, reach potential customers, and direct interested shoppers to their own platforms.</p>
            <p className="mt-6 border-l-4 border-fuchsia-500 pl-4 text-xl font-semibold text-fuchsia-700">We don’t replace merchants. We connect them with customers.</p>
          </section>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-200 sm:p-8">
              <h2 className="text-2xl font-bold text-gray-900">What Guides Us</h2>
              <ul className="mt-4 space-y-3 leading-7 text-gray-700">
                <li><strong className="text-gray-900">Choice:</strong> make it easier to discover products across different merchants.</li>
                <li><strong className="text-gray-900">Clarity:</strong> help customers compare the product details merchants provide.</li>
                <li><strong className="text-gray-900">Useful technology:</strong> make virtual fitting an exploratory tool for fashion discovery.</li>
                <li><strong className="text-gray-900">Partnership:</strong> connect shoppers with merchants while each merchant manages its own products and purchases.</li>
              </ul>
            </section>
            <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-200 sm:p-8">
              <h2 className="text-2xl font-bold text-gray-900">Privacy and Transparency</h2>
              <p className="mt-4 leading-7 text-gray-700">Photos and measurements used for a Digital Twin are personal information. We explain how information is handled and when images may be processed by AI service providers in our Privacy Policy.</p>
              <div className="mt-5 flex flex-wrap gap-4">
                <Link href="/privacy" className="font-semibold text-fuchsia-700 underline">Read our Privacy Policy</Link>
                <Link href="/terms" className="font-semibold text-fuchsia-700 underline">Read our Terms &amp; Conditions</Link>
              </div>
            </section>
          </div>

          <section className="mt-10 rounded-3xl bg-fuchsia-50 p-6 ring-1 ring-fuchsia-100 sm:p-9">
            <h2 className="text-2xl font-bold text-gray-900">Are You a Fashion Merchant?</h2>
            <p className="mt-4 max-w-4xl leading-7 text-gray-700">Showcase your collection on a platform built to help customers discover and explore fashion. Merchants keep managing their own product details and handle purchases through their own sales channels.</p>
            <Link href="/merchant/onboarding" className="mt-5 inline-flex rounded-xl bg-fuchsia-700 px-5 py-3 font-semibold text-white hover:bg-fuchsia-800">Explore merchant onboarding</Link>
          </section>

          <section className="mt-10 rounded-3xl bg-gray-900 px-6 py-10 text-center text-white sm:px-10">
            <h2 className="text-2xl font-bold">Experience Fashion Differently</h2>
            <p className="mx-auto mt-4 max-w-3xl leading-7 text-gray-300">Discover more styles, explore different collections, and see how garments could look on you with Universal Virtual Fitting Room.</p>
            <p className="mt-5 text-lg font-semibold text-fuchsia-300">Your next favourite outfit could be just a virtual try-on away!</p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
