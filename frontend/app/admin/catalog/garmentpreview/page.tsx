"use client";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Package,
  DollarSign,
  Shirt,
  Warehouse,
  Clock,
} from "lucide-react";
   
export default function GarmentDetailsPage() {
  const router = useRouter();
  const garment = {
    id: "TS001",
    name: "Premium Cotton T-Shirt",
    category: "T-Shirts",
    brand: "Urban Wear",
    sku: "TS001",
    status: "Active",
    price: 25,
    cost: 12,
    stock: 120,
    reserved: 8,
    fabric: "100% Cotton",
    fit: "Regular",
    pattern: "Solid",
    sleeve: "Short Sleeve",
    description:
      "Premium cotton t-shirt with breathable fabric suitable for everyday wear.",
    images: [
      "https://placehold.co/600x600",
      "https://placehold.co/150",
      "https://placehold.co/150",
      "https://placehold.co/150",
    ],
    variants: [
      { color: "Black", size: "S", stock: 20 },
      { color: "Black", size: "M", stock: 35 },
      { color: "Black", size: "L", stock: 28 },
      { color: "White", size: "M", stock: 18 },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between rounded-xl bg-white p-6 shadow">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-700 transition hover:bg-gray-50"
            >
              <ArrowLeft size={18} />
              Back
            </button>

            <div>
              <h1 className="text-3xl font-bold">{garment.name}</h1>
              <p className="text-gray-500">
                SKU: {garment.sku} • {garment.category}
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white">
              <Pencil size={18} />
              Edit
            </button>

            <button className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-white">
              <Trash2 size={18} />
              Delete
            </button>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid gap-6 lg:grid-cols-3">

          {/* Left Column */}
          <div className="space-y-6 lg:col-span-2">

            {/* Image */}
            <div className="rounded-xl bg-white p-6 shadow">
              <img
                src={garment.images[0]}
                alt={garment.name}
                className="h-[450px] w-full rounded-lg object-cover"
              />

              <div className="mt-4 flex gap-3">
                {garment.images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt=""
                    className="h-20 w-20 rounded-lg border object-cover"
                  />
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="rounded-xl bg-white p-6 shadow">
              <h2 className="mb-4 text-xl font-semibold">
                Description
              </h2>

              <p className="text-gray-600">
                {garment.description}
              </p>
            </div>

            {/* Variants */}
            <div className="rounded-xl bg-white p-6 shadow">
              <h2 className="mb-5 text-xl font-semibold">
                Variants
              </h2>

              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="py-3 text-left">Color</th>
                    <th className="text-left">Size</th>
                    <th className="text-left">Stock</th>
                  </tr>
                </thead>

                <tbody>
                  {garment.variants.map((variant, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-3">{variant.color}</td>
                      <td>{variant.size}</td>
                      <td>{variant.stock}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>

          {/* Right Column */}
          <div className="space-y-6">

            {/* Status */}
            <div className="rounded-xl bg-white p-6 shadow">
              <h2 className="mb-5 text-lg font-semibold">
                Status
              </h2>

              <span className="rounded-full bg-green-100 px-4 py-2 text-sm font-medium text-green-700">
                {garment.status}
              </span>
            </div>

            {/* Pricing */}
            <div className="rounded-xl bg-white p-6 shadow">

              <h2 className="mb-5 flex items-center gap-2 text-lg font-semibold">
                <DollarSign size={18} />
                Pricing
              </h2>

              <div className="space-y-4">

                <div className="flex justify-between">
                  <span>Cost Price</span>
                  <span>${garment.cost}</span>
                </div>

                <div className="flex justify-between">
                  <span>Selling Price</span>
                  <span>${garment.price}</span>
                </div>

              </div>
            </div>

            {/* Inventory */}
            <div className="rounded-xl bg-white p-6 shadow">

              <h2 className="mb-5 flex items-center gap-2 text-lg font-semibold">
                <Warehouse size={18} />
                Inventory
              </h2>

              <div className="space-y-4">

                <div className="flex justify-between">
                  <span>Available</span>
                  <span>{garment.stock}</span>
                </div>

                <div className="flex justify-between">
                  <span>Reserved</span>
                  <span>{garment.reserved}</span>
                </div>

              </div>

            </div>

            {/* Fabric */}
            <div className="rounded-xl bg-white p-6 shadow">

              <h2 className="mb-5 flex items-center gap-2 text-lg font-semibold">
                <Shirt size={18} />
                Garment Details
              </h2>

              <div className="space-y-3">

                <div className="flex justify-between">
                  <span>Fabric</span>
                  <span>{garment.fabric}</span>
                </div>

                <div className="flex justify-between">
                  <span>Fit</span>
                  <span>{garment.fit}</span>
                </div>

                <div className="flex justify-between">
                  <span>Pattern</span>
                  <span>{garment.pattern}</span>
                </div>

                <div className="flex justify-between">
                  <span>Sleeve</span>
                  <span>{garment.sleeve}</span>
                </div>

              </div>

            </div>

            {/* Activity */}
            <div className="rounded-xl bg-white p-6 shadow">

              <h2 className="mb-5 flex items-center gap-2 text-lg font-semibold">
                <Clock size={18} />
                Activity
              </h2>

              <div className="space-y-3 text-sm">

                <p>Created: Jan 10, 2026</p>

                <p>Updated: Jan 14, 2026</p>

                <p>Last Sold: Today</p>

              </div>

            </div>

          </div>

        </div>
      </div>
    </div>
  );
}