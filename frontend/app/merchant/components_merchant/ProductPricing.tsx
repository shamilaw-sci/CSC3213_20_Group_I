export default function ProductPricing() {
  return (
    <section className="mt-8 rounded-3xl bg-white p-8 shadow-lg">

      <h2 className="text-2xl font-bold text-gray-800">
        Pricing & Inventory
      </h2>

      <p className="mt-2 text-gray-500">
        Manage product price, stock and availability.
      </p>


      <div className="mt-8 grid gap-6 md:grid-cols-2">


        {/* Original Price */}
        <div>
          <label className="mb-2 block font-semibold">
            Original Price
          </label>

          <input
            type="number"
            placeholder="100"
            className="w-full rounded-xl border border-gray-300 p-3 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-300"
          />
        </div>


        {/* Selling Price */}
        <div>
          <label className="mb-2 block font-semibold">
            Selling Price
          </label>

          <input
            type="number"
            placeholder="80"
            className="w-full rounded-xl border border-gray-300 p-3 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-300"
          />
        </div>


        {/* Currency */}
        <div>
          <label className="mb-2 block font-semibold">
            Currency
          </label>

          <select
            className="w-full rounded-xl border border-gray-300 p-3"
          >
            <option>LKR</option>
            <option>USD</option>
            <option>EUR</option>
          </select>
        </div>


        {/* Stock */}
        <div>
          <label className="mb-2 block font-semibold">
            Total Stock Quantity
          </label>

          <input
            type="number"
            placeholder="50"
            className="w-full rounded-xl border border-gray-300 p-3 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-300"
          />
        </div>


        {/* Barcode */}
        <div>
          <label className="mb-2 block font-semibold">
            Barcode
          </label>

          <input
            type="text"
            placeholder="890123456789"
            className="w-full rounded-xl border border-gray-300 p-3 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-300"
          />
        </div>


        {/* Availability */}
        <div>
          <label className="mb-2 block font-semibold">
            Availability
          </label>

          <select
            className="w-full rounded-xl border border-gray-300 p-3"
          >
            <option>Available</option>
            <option>Out of Stock</option>
            <option>Pre Order</option>
          </select>

        </div>


      </div>


      {/* Discount */}

      <div className="mt-8 rounded-2xl bg-purple-50 p-5">

        <h3 className="font-semibold text-purple-700">
          Discount Settings
        </h3>


        <div className="mt-4 grid gap-5 md:grid-cols-2">


          <div>

            <label className="mb-2 block font-medium">
              Discount Percentage
            </label>

            <input
              type="number"
              placeholder="20%"
              className="w-full rounded-xl border border-gray-300 p-3"
            />

          </div>


          <div>

            <label className="mb-2 block font-medium">
              Discount Period
            </label>

            <input
              type="date"
              className="w-full rounded-xl border border-gray-300 p-3"
            />

          </div>


        </div>

      </div>


    </section>
  );
}