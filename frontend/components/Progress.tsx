/** WBS-Shared | Owner: All members | Branch: reviewed integration branch | Scope: Shared application foundation. */
export default function Progress() {
  return (
    <div id="how-it-works" className="bg-gradient-to-r from-purple-100 to-white py-24 sm:py-32">

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        
        {/* Heading */}
        <div className="mx-auto max-w-2xl lg:text-center">
          <p className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl lg:text-balance bg-gradient-to-r from-blue-800 via-blue-700 to-pink-600 bg-clip-text text-transparent">
            How It Works
          </p>

          <p className="mt-6 text-lg/8 text-gray-800">
            Get started in four simple steps and transform your shopping experience
          </p>
        </div>
      </div>

      {/* STEPPER CONTAINER */}
      <div className="w-full max-w-5xl mx-auto p-6">

        {/* CHANGE HERE 👉 flex-col on mobile, row on desktop */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between relative gap-10 md:gap-0">

          {/* LINE (horizontal desktop) */}
          <div className="hidden md:block absolute top-5 left-0 w-full h-1 bg-gray-300 z-0"></div>

          {/* LINE (vertical mobile) */}
          <div className="md:hidden absolute left-5 top-0 h-full w-1 bg-gray-300 z-0"></div>

          {/* STEP 1 */}
          <div className="flex flex-col items-start md:items-center z-10">
            <div className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center">
              1
            </div>
            <p className="text-base font-semibold text-blue-800 mt-3 md:mt-5">
              Upload Your Photo
            </p>
            <p className="text-black md:text-center mt-1">
              Take a full-body photo in good lighting and upload it securely
            </p>
          </div>

          {/* STEP 2 */}
          <div className="flex flex-col items-start md:items-center z-10">
            <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center">
              2
            </div>
            <p className="text-base font-semibold text-blue-800 mt-3 md:mt-5">
              Generate Digital Twin
            </p>
            <p className="text-black md:text-center mt-1">
              Our AI creates a precise 3D model of your measurements
            </p>
          </div>

          {/* STEP 3 */}
          <div className="flex flex-col items-start md:items-center z-10">
            <div className="w-10 h-10 rounded-full bg-purple-300 text-black flex items-center justify-center">
              3
            </div>
            <p className="text-base font-semibold text-blue-800 mt-3 md:mt-5">
              Try Clothes Instantly
            </p>
            <p className="text-black md:text-center mt-1">
              Browse thousands of items and see them on your Digital Twin
            </p>
          </div>

          {/* STEP 4 */}
          <div className="flex flex-col items-start md:items-center z-10">
            <div className="w-10 h-10 rounded-full bg-gray-300 text-black flex items-center justify-center">
              4
            </div>
            <p className="text-base font-semibold text-blue-800 mt-3 md:mt-5">
              Buy from Stores
            </p>
            <p className="text-black md:text-center mt-1">
              Shop confidently from partnered stores with perfect fit guaranteed
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
