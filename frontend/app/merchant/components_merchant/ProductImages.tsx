export default function ProductImages() {
  return (
    <section className="rounded-3xl bg-white p-8 shadow-lg">

      <h2 className="text-2xl font-bold text-gray-800">
        Product Images
      </h2>

      <p className="mt-2 text-gray-500">
        Upload high-quality product images.
      </p>

      {/* Main Image */}

      <div className="mt-8">

        <label className="mb-3 block text-lg font-semibold">
          Main Product Image
        </label>

        <div className="flex h-72 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-purple-300 bg-purple-50 transition hover:border-purple-500">

          <div className="text-6xl">
            📷
          </div>

          <p className="mt-4 text-lg font-semibold">
            Drag & Drop Image
          </p>

          <p className="text-gray-500">
            JPG, PNG or WEBP
          </p>

          <button className="mt-6 rounded-xl bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 px-6 py-3 font-semibold text-white">
            Browse Files
          </button>

        </div>

      </div>

      {/* Gallery */}

      <div className="mt-10">

        <label className="mb-4 block text-lg font-semibold">
          Gallery Images
        </label>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">

          {[1,2,3,4].map((item)=>(
            <div
              key={item}
              className="flex h-44 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 hover:border-purple-400"
            >

              <span className="text-5xl">
                +
              </span>

              <p className="mt-2 text-sm text-gray-500">
                Add Image
              </p>

            </div>
          ))}

        </div>

      </div>

    </section>
  );
}