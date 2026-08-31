/** WBS-3.x | Owner: S/21/501 | Branch: feature/s21-501-catalogue-merchants | Scope: Catalogue, merchants, comparison and redirects. */
import Link from "next/link";

const products = [
  {
    id: 1,
    name: 'Basic Tee',
    href: '/explore',
    imageSrc: 'https://tailwindcss.com/plus-assets/img/ecommerce-images/product-page-01-related-product-01.jpg',
    imageAlt: "Front of men's Basic Tee in black.",
    price: '$35',
    color: 'Black',
  },
  {
    id: 2,
    name: 'Basic Tee',
    href: '/explore',
    imageSrc: 'https://tailwindcss.com/plus-assets/img/ecommerce-images/product-page-01-related-product-02.jpg',
    imageAlt: "Front of men's Basic Tee in white.",
    price: '$35',
    color: 'Aspen White',
  },
  {
    id: 3,
    name: 'Basic Tee',
    href: '/explore',
    imageSrc: 'https://tailwindcss.com/plus-assets/img/ecommerce-images/product-page-01-related-product-03.jpg',
    imageAlt: "Front of men's Basic Tee in dark gray.",
    price: '$35',
    color: 'Charcoal',
  },
  {
    id: 4,
    name: 'Artwork Tee',
    href: '/explore',
    imageSrc: 'https://tailwindcss.com/plus-assets/img/ecommerce-images/product-page-01-related-product-04.jpg',
    imageAlt: "Front of men's Artwork Tee in peach with white and brown dots forming an isometric cube.",
    price: '$35',
    color: 'Iso Dots',
  },
]

export default function ProductsList() {
  return (
    <div className="bg-gradient-to-r from-pink-100 to-gray-300 py-24 sm:py-32">
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
        <p className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl lg:text-balance text-black text-center pb-5 ">
            Trending Outfits
          </p>
        <h2 className="text-2xl  tracking-tight text-gray-600 text-center mb-20 ">Explore the latest fashion from top brands and try them on instantly

</h2>

        <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
          {products.map((product) => (
            <div key={product.id} className="group relative">
              <img
                alt={product.imageAlt}
                src={product.imageSrc}
                className="aspect-square w-full rounded-md bg-gray-200 object-cover group-hover:opacity-75 lg:aspect-auto lg:h-80"
              />
              <div className="mt-4 flex justify-between">
                <div>
                  <h3 className="text-md text-gray-700 font-semibold ">
                    <a href={product.href}>
                      <span aria-hidden="true" className="absolute inset-0" />
                      {product.name}
                    </a>
                  </h3>
                  <p className="mt-1 text-md text-gray-500">{product.color}</p>
                </div>
                <p className="text-xl font-medium  text-blue-900 pr-10 font-semibold">{product.price}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
         <div className="flex justify-center">
             <Link href="/explore" className="px-6 py-3 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition">
                Explore All Items
            </Link>
        </div>
    </div>
  )
}
