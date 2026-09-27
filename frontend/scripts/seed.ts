import { randomUUID } from "node:crypto";
import { prisma } from "../server/db/prisma";

const categories = ["Dresses", "Tops", "Bottoms", "Accessories"];
const merchants = [
  { name: "Fashion Hub", email: "catalog@fashionhub.example" },
  { name: "Style Corner", email: "catalog@stylecorner.example" },
];
const products = [
  { name: "Elegant Evening Dress", merchant: "Fashion Hub", category: "Dresses", price: 129.99, image: "https://images.pexels.com/photos/14801160/pexels-photo-14801160.jpeg" },
  { name: "Summer Casual Dress", merchant: "Style Corner", category: "Dresses", price: 79.99, image: "https://images.pexels.com/photos/8209332/pexels-photo-8209332.jpeg" },
  { name: "Floral Garden Midi Dress", merchant: "Fashion Hub", category: "Dresses", price: 95.0, image: "https://images.pexels.com/photos/985635/pexels-photo-985635.jpeg" },
  { name: "Midnight Satin Gown", merchant: "Style Corner", category: "Dresses", price: 185.0, image: "https://images.pexels.com/photos/1755428/pexels-photo-1755428.jpeg" },
  { name: "Classic Linen Wrap Dress", merchant: "Fashion Hub", category: "Dresses", price: 110.0, image: "https://images.pexels.com/photos/1375736/pexels-photo-1375736.jpeg" },
  { name: "Rose Pleated Party Dress", merchant: "Style Corner", category: "Dresses", price: 135.0, image: "https://images.pexels.com/photos/1021693/pexels-photo-1021693.jpeg" },
  { name: "Business Casual Blouse", merchant: "Fashion Hub", category: "Tops", price: 59.99, image: "https://images.pexels.com/photos/8289271/pexels-photo-8289271.jpeg" },
  { name: "Trendy Crop Top", merchant: "Style Corner", category: "Tops", price: 39.99, image: "https://images.pexels.com/photos/14581932/pexels-photo-14581932.jpeg" },
];

// Example-labelled demo size chart used only for local recommendation testing.
// Leave fit ranges absent for products where the merchant has not supplied a chart.
const demoFitRangesByProduct = {
  "Elegant Evening Dress": {
    S: { chest: { min: 82, max: 88 }, waist: { min: 66, max: 72 }, hips: { min: 90, max: 96 } },
    M: { chest: { min: 89, max: 96 }, waist: { min: 73, max: 80 }, hips: { min: 97, max: 104 } },
    L: { chest: { min: 97, max: 104 }, waist: { min: 81, max: 88 }, hips: { min: 105, max: 112 } },
    XL: { chest: { min: 105, max: 114 }, waist: { min: 89, max: 98 }, hips: { min: 113, max: 122 } },
  },
} as const;

async function main() {
  const categoryByName = new Map<string, string>();
  for (const name of categories) {
    const category = await prisma.category.upsert({ where: { slug: name.toLowerCase() }, create: { categoryId: randomUUID(), name, slug: name.toLowerCase(), updatedAt: new Date() }, update: { name, updatedAt: new Date() } });
    categoryByName.set(name, category.categoryId);
  }
  const merchantByName = new Map<string, string>();
  for (const item of merchants) {
    const merchant = await prisma.merchant.upsert({ where: { email: item.email }, create: { merchantId: randomUUID(), storeName: item.name, email: item.email, status: "ACTIVE", updatedAt: new Date() }, update: { storeName: item.name, status: "ACTIVE", updatedAt: new Date() } });
    merchantByName.set(item.name, merchant.merchantId);
  }
  for (const item of products) {
    const merchantId = merchantByName.get(item.merchant)!; const categoryId = categoryByName.get(item.category)!; const externalId = item.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const demoRanges = demoFitRangesByProduct[item.name as keyof typeof demoFitRangesByProduct];
    await prisma.product.upsert({ where: { merchantId_externalId: { merchantId, externalId } }, create: { productId: randomUUID(), merchantId, categoryId, externalId, productName: item.name, price: item.price, primaryImageUrl: item.image, merchantUrl: "https://example.com", status: "ACTIVE", updatedAt: new Date(), productvariant: { create: ["S", "M", "L", "XL"].map((size) => ({ productVariantId: randomUUID(), sku: `${externalId}-${size}`, size, stockQuantity: 10, metadata: demoRanges?.[size as keyof typeof demoRanges] ? { fitRangesCm: demoRanges[size as keyof typeof demoRanges] } : undefined, updatedAt: new Date() })) } }, update: { categoryId, productName: item.name, price: item.price, primaryImageUrl: item.image, status: "ACTIVE", updatedAt: new Date() } });
  }
  console.log("TryVora catalog seed completed.");
}
main().catch((error) => { console.error(error); process.exitCode = 1; }).finally(() => prisma.$disconnect());
