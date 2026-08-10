export default function ProductVariants() {

  const sizes = [
    "XS",
    "S",
    "M",
    "L",
    "XL",
    "XXL"
  ];


  const colors = [
    "Black",
    "White",
    "Blue",
    "Pink",
    "Purple"
  ];


  return (

    <section className="mt-8 rounded-3xl bg-white p-8 shadow-lg">


      <h2 className="text-2xl font-bold text-gray-800">
        Product Variants
      </h2>


      <p className="mt-2 text-gray-500">
        Add available sizes, colors and stock variations.
      </p>



      {/* Sizes */}

      <div className="mt-8">


        <h3 className="font-semibold">
          Available Sizes
        </h3>


        <div className="mt-4 flex flex-wrap gap-3">


          {sizes.map((size)=>(

            <button
              key={size}
              className="rounded-xl border border-purple-300 px-6 py-3 font-medium text-purple-700 transition hover:bg-purple-600 hover:text-white"
            >
              {size}
            </button>

          ))}


        </div>


      </div>



      {/* Colors */}

      <div className="mt-10">


        <h3 className="font-semibold">
          Available Colors
        </h3>


        <div className="mt-4 flex flex-wrap gap-4">


          {colors.map((color)=>(

            <button
              key={color}
              className="flex items-center gap-3 rounded-xl border px-5 py-3 hover:border-purple-500"
            >

              <span
                className={`
                h-5 w-5 rounded-full
                ${
                  color==="Black"
                  ?"bg-black"
                  :
                  color==="White"
                  ?"bg-white border"
                  :
                  color==="Blue"
                  ?"bg-blue-500"
                  :
                  color==="Pink"
                  ?"bg-pink-500"
                  :
                  "bg-purple-500"
                }
                `}
              />

              {color}

            </button>

          ))}


        </div>


      </div>




      {/* Size Stock */}

      <div className="mt-10">


        <h3 className="font-semibold">
          Stock By Size
        </h3>



        <div className="mt-5 space-y-4">


          {sizes.slice(1,5).map((size)=>(


            <div
              key={size}
              className="flex items-center justify-between rounded-xl bg-gray-50 p-4"
            >


              <span className="font-medium">
                Size {size}
              </span>


              <input
                type="number"
                placeholder="Quantity"
                className="w-40 rounded-lg border border-gray-300 p-2"
              />


            </div>


          ))}


        </div>


      </div>



      {/* Variant Images */}

      <div className="mt-10">


        <h3 className="font-semibold">
          Variant Images
        </h3>


        <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">


          {[1,2,3,4].map((item)=>(

            <div
              key={item}
              className="flex h-36 items-center justify-center rounded-xl border-2 border-dashed border-gray-300 text-gray-400"
            >

              +
              Add Image

            </div>

          ))}


        </div>


      </div>


    </section>

  );
}