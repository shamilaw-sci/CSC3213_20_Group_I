export default function ProductHeader() {
  return (
    <section className="mb-8 rounded-3xl bg-white p-8 shadow-lg">

      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">

        <div>

          <p className="text-sm font-medium text-purple-600">
            Merchant Dashboard
          </p>

          <h1 className="mt-2 text-4xl font-bold text-gray-900">
            Add New Product
          </h1>

          <p className="mt-3 text-gray-500">
            Upload your clothing product, images, sizes and pricing.
          </p>

        </div>

        <div className="flex gap-4">

          <button className="rounded-xl border border-purple-600 px-6 py-3 font-semibold text-purple-700 transition hover:bg-purple-50">
            Save Draft
          </button>

          <button className="rounded-xl bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 px-8 py-3 font-semibold text-white shadow-lg transition hover:scale-105">
            Publish
          </button>

        </div>

      </div>

    </section>
  );
}