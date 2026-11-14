import type { Metadata } from "next";
import Footer from "@/components/Footer";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "Blog | Universal Virtual Fitting Room",
  description: "Ideas and guides for discovering fashion, comparing products, and exploring virtual fitting.",
};

const articles = [
  {
    id: "virtual-try-on-guide",
    category: "Virtual Try-On",
    title: "A New Way to Explore an Outfit Before You Shop",
    summary: "Virtual try-on gives you a visual preview of a selected garment on your Digital Twin or uploaded photo, so you can explore styles while browsing.",
    paragraphs: [
      "Shopping for clothes online often means imagining how a garment might look on you. A virtual try-on can add another point of reference: choose an item, select an image, and view an AI-generated preview.",
      "Start with a clear, well-lit photo and follow the image guidance shown in the experience. Then choose a garment you are considering and generate a preview. You can use the result to explore different looks and compare items as you browse.",
      "A generated image is only a visual reference. It may not accurately represent the garment’s real colour, fabric, size, or fit, so check the merchant’s product information and sizing guidance before buying.",
    ],
  },
  {
    id: "digital-twin-tips",
    category: "Digital Twin",
    title: "Getting Ready to Create Your Digital Twin",
    summary: "A few practical tips can help you prepare the photos and measurements used for a more personalized virtual fitting experience.",
    paragraphs: [
      "Your Digital Twin uses photographs and body measurements you provide. Before you begin, review the guidance in the Digital Twin setup and gather the information it asks for.",
      "Choose a clear, well-lit photo where your body is visible. A simple background and an unfiltered image can make it easier to see the details in the photo. Enter measurements carefully, and check them before submitting.",
      "You can manage your Digital Twin through the available profile features. Because photos and measurements are personal information, read the Privacy Policy to understand how they are handled and may be processed for virtual try-on.",
    ],
  },
  {
    id: "fashion-discovery",
    category: "Fashion Discovery",
    title: "Compare Finds Across Fashion Merchants",
    summary: "Explore different stores in one place and use product details to compare styles that catch your eye.",
    paragraphs: [
      "When you are looking for a new piece, it can help to see options from more than one merchant. Browse products, open the details, and compare the information available, such as brand, colour, size, style, and price.",
      "Product listings and availability come from merchants and may change. Once you find an item you like, follow its merchant link to check the latest details and complete your purchase directly with that store.",
      "TryVora helps bring discovery and virtual fitting together, while each merchant continues to manage its own products and sales.",
    ],
  },
];

export default function BlogPage() {
  return (
    <>
      <Header />
      <main className="bg-gray-50 px-6 py-12 sm:py-16">
        <div className="mx-auto max-w-6xl">
          <section className="rounded-3xl bg-gradient-to-br from-purple-700 via-fuchsia-600 to-blue-600 px-6 py-12 text-white shadow-lg sm:px-12 sm:py-14">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/80">The TryVora Blog</p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">Ideas for exploring fashion</h1>
            <p className="mt-5 max-w-3xl leading-7 text-white/90">Guides and inspiration for discovering new styles, comparing products, and making the most of virtual fitting.</p>
          </section>

          <section aria-label="Featured articles" className="mt-10 grid gap-5 md:grid-cols-3">
            {articles.map((article) => (
              <article key={article.id} className="flex flex-col rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
                <p className="text-sm font-semibold text-fuchsia-700">{article.category}</p>
                <h2 className="mt-3 text-xl font-bold leading-snug text-gray-900">{article.title}</h2>
                <p className="mt-3 flex-1 leading-7 text-gray-700">{article.summary}</p>
                <a href={`#${article.id}`} className="mt-5 font-semibold text-fuchsia-700 hover:underline">Read article <span aria-hidden="true">→</span></a>
              </article>
            ))}
          </section>

          <div className="mt-10 space-y-8">
            {articles.map((article) => (
              <article id={article.id} key={article.id} className="scroll-mt-6 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-200 sm:p-9">
                <p className="text-sm font-semibold text-fuchsia-700">{article.category}</p>
                <h2 className="mt-2 text-2xl font-bold text-gray-900">{article.title}</h2>
                <div className="mt-4 max-w-4xl space-y-4 leading-7 text-gray-700">
                  {article.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                </div>
              </article>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
