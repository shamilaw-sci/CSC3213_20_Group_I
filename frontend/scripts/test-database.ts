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
    await prisma.product.upsert({ where: { merchantId_externalId: { merchantId, externalId } }, create: { productId: randomUUID(), merchantId, categoryId, externalId, productName: item.name, price: item.price, primaryImageUrl: item.image, merchantUrl: "https://example.com", status: "ACTIVE", updatedAt: new Date(), productvariant: { create: ["S", "M", "L", "XL"].map((size) => ({ productVariantId: randomUUID(), sku: `${externalId}-${size}`, size, stockQuantity: 10, updatedAt: new Date() })) } }, update: { categoryId, productName: item.name, price: item.price, primaryImageUrl: item.image, status: "ACTIVE", updatedAt: new Date() } });
  }
  console.log("TryVora catalog seed completed.");
}
main().catch((error) => { console.error(error); process.exitCode = 1; }).finally(() => prisma.$disconnect());
