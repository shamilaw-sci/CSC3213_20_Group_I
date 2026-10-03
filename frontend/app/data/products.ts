export type Category = "Dresses" | "Tops" | "Bottoms" | "Accessories";

export interface Product {
  id: string | number;
  title: string;
  store: string;
  price: number;
  currency?: string;
  image: string;
  category: Category;
  categorySlug?: string;
  variants?: {
    size: string | null;
    color: string | null;
    stock: number | null;
  }[];
}

// 👉 image walata ohe app eke /public folder eke images dala, path change karaganna
export const products: Product[] = [
  {
    id: 1,
    title: "Elegant Evening Dress",
    store: "Fashion Hub",
    price: 129.99,
    image: "https://images.pexels.com/photos/14801160/pexels-photo-14801160.jpeg",
    category: "Dresses",
  },
  {
    id: 2,
    title: "Summer Casual Dress",
    store: "Style Corner",
    price: 79.99,
    image: "https://images.pexels.com/photos/8209332/pexels-photo-8209332.jpeg",
    category: "Dresses",
  },
  {
    id: 3,
    title: "Formal Evening Gown",
    store: "Luxury Boutique",
    price: 249.99,
    image: "https://images.pexels.com/photos/28115171/pexels-photo-28115171.jpeg",
    category: "Dresses",
  },
  {
    id: 4,
    title: "Floral Print Dress",
    store: "Eastern Fashion",
    price: 89.99,
    image: "https://images.pexels.com/photos/33682520/pexels-photo-33682520.jpeg",
    category: "Dresses",
  },
  {
    id: 5,
    title: "Business Casual Blouse",
    store: "Professional Wear",
    price: 59.99,
    image: "https://images.pexels.com/photos/8289271/pexels-photo-8289271.jpeg",
    category: "Tops",
  },
  {
    id: 6,
    title: "Trendy Crop Top",
    store: "Youth Trends",
    price: 39.99,
    image: "https://images.pexels.com/photos/14581932/pexels-photo-14581932.jpeg",
    category: "Tops",
  },
  {
    id: 7,
    title: "Boho Maxi Dress",
    store: "Bohemian Vibes",
    price: 119.99,
    image: "https://images.pexels.com/photos/5651312/pexels-photo-5651312.jpeg",
    category: "Dresses",
  },
  {
    id: 8,
    title: "Party Cocktail Dress",
    store: "Night Out Collection",
    price: 149.99,
    image: "https://images.pexels.com/photos/3402700/pexels-photo-3402700.jpeg",
    category: "Dresses",
  },
];
