export default function ProductBasicInfo() {
  return (
    <section className="mt-8 rounded-3xl bg-white p-8 shadow-lg">

      <h2 className="text-2xl font-bold text-gray-800">
        Basic Product Information
      </h2>

      <p className="mt-2 text-gray-500">
        Enter the basic details about your clothing product.
      </p>

      <div className="mt-8 grid gap-6 md:grid-cols-2">

        {/* Product Name */}
        <div>
          <label className="mb-2 block font-semibold">
            Product Name
          </label>

          <input
            type="text"
            placeholder="Oversized Cotton T-Shirt"
            className="w-full rounded-xl border border-gray-300 p-3 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-300"
          />
        </div>

        {/* Brand */}
        <div>
          <label className="mb-2 block font-semibold">
            Brand
          </label>

          <input
            type="text"
            placeholder="Nike"
            className="w-full rounded-xl border border-gray-300 p-3 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-300"
          />
        </div>

        {/* SKU */}
        <div>
          <label className="mb-2 block font-semibold">
            SKU
          </label>

          <input
            type="text"
            placeholder="NK-TS-1001"
            className="w-full rounded-xl border border-gray-300 p-3 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-300"
          />
        </div>

        {/* Product Code */}
        <div>
          <label className="mb-2 block font-semibold">
            Product Code
          </label>

          <input
            type="text"
            placeholder="PRD-001"
            className="w-full rounded-xl border border-gray-300 p-3 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-300"
          />
        </div>

        {/* Gender */}
        <div>
          <label className="mb-2 block font-semibold">
            Gender
          </label>

          <select className="w-full rounded-xl border border-gray-300 p-3">
            <option>Men</option>
            <option>Women</option>
            <option>Unisex</option>
            <option>Kids</option>
          </select>
        </div>

        {/* Category */}
        <div>
          <label className="mb-2 block font-semibold">
            Category
          </label>

          <select className="w-full rounded-xl border border-gray-300 p-3">
            <option>T-Shirts</option>
            <option>Shirts</option>
            <option>Hoodies</option>
            <option>Jeans</option>
            <option>Jackets</option>
            <option>Dresses</option>
          </select>
        </div>

        {/* Sub Category */}
        <div>
          <label className="mb-2 block font-semibold">
            Sub Category
          </label>

          <input
            type="text"
            placeholder="Oversized"
            className="w-full rounded-xl border border-gray-300 p-3 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-300"
          />
        </div>

        {/* Season */}
        <div>
          <label className="mb-2 block font-semibold">
            Season
          </label>

          <select className="w-full rounded-xl border border-gray-300 p-3">
            <option>Summer</option>
            <option>Winter</option>
            <option>Spring</option>
            <option>Autumn</option>
            <option>All Seasons</option>
          </select>
        </div>

      </div>

    </section>
  );
}