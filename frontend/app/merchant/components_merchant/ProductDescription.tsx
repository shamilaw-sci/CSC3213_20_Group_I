export default function ProductDescription() {
  return (
    <section className="mt-8 rounded-3xl bg-white p-8 shadow-lg">

      <h2 className="text-2xl font-bold text-gray-800">
        Product Description
      </h2>

      <p className="mt-2 text-gray-500">
        Describe your product to help customers understand it better.
      </p>

      <div className="mt-8 space-y-6">

        {/* Short Description */}
        <div>
          <label className="mb-2 block font-semibold">
            Short Description
          </label>

          <textarea
            rows={3}
            placeholder="A short summary of the product..."
            className="w-full rounded-xl border border-gray-300 p-3 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-300"
          ></textarea>
        </div>

        {/* Full Description */}
        <div>
          <label className="mb-2 block font-semibold">
            Detailed Description
          </label>

          <textarea
            rows={6}
            placeholder="Write a detailed product description..."
            className="w-full rounded-xl border border-gray-300 p-3 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-300"
          ></textarea>
        </div>

        <div className="grid gap-6 md:grid-cols-2">

          {/* Material */}
          <div>
            <label className="mb-2 block font-semibold">
              Material
            </label>

            <input
              type="text"
              placeholder="100% Cotton"
              className="w-full rounded-xl border border-gray-300 p-3 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-300"
            />
          </div>

          {/* Pattern */}
          <div>
            <label className="mb-2 block font-semibold">
              Pattern
            </label>

            <input
              type="text"
              placeholder="Printed"
              className="w-full rounded-xl border border-gray-300 p-3 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-300"
            />
          </div>

        </div>

        {/* Care Instructions */}
        <div>
          <label className="mb-2 block font-semibold">
            Care Instructions
          </label>

          <textarea
            rows={4}
            placeholder="Machine wash cold. Do not bleach..."
            className="w-full rounded-xl border border-gray-300 p-3 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-300"
          ></textarea>
        </div>

      </div>

    </section>
  );
}