export default function Progress() {
  return (
    <section id="how-it-works" className="scroll-mt-28 bg-gradient-to-r from-purple-100 to-white py-24 sm:py-32">

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        
        {/* Heading */}
        <div className="mx-auto max-w-2xl lg:text-center">
          <p className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl lg:text-balance bg-gradient-to-r from-blue-800 via-blue-700 to-pink-600 bg-clip-text text-transparent">
            How It Works
          </p>

          <p className="mt-6 text-lg/8 text-gray-800">
            From your profile to products, previews, and partner stores in four steps
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
              Set Up Your Profile
            </p>
            <p className="text-black md:text-center mt-1">
              Add measurements and, if you choose, upload a Digital Twin photo
            </p>
          </div>

          {/* STEP 2 */}
          <div className="flex flex-col items-start md:items-center z-10">
            <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center">
              2
            </div>
            <p className="text-base font-semibold text-blue-800 mt-3 md:mt-5">
              Explore and Discover
            </p>
            <p className="text-black md:text-center mt-1">
              Browse products and get recommendations when fit or interest data is available
            </p>
          </div>

          {/* STEP 3 */}
          <div className="flex flex-col items-start md:items-center z-10">
            <div className="w-10 h-10 rounded-full bg-purple-300 text-black flex items-center justify-center">
              3
            </div>
            <p className="text-base font-semibold text-blue-800 mt-3 md:mt-5">
              Save and Preview
            </p>
            <p className="text-black md:text-center mt-1">
              Save favorites and open the available Try-On preview for a product
            </p>
          </div>

          {/* STEP 4 */}
          <div className="flex flex-col items-start md:items-center z-10">
            <div className="w-10 h-10 rounded-full bg-gray-300 text-black flex items-center justify-center">
              4
            </div>
            <p className="text-base font-semibold text-blue-800 mt-3 md:mt-5">
              Visit the Merchant
            </p>
            <p className="text-black md:text-center mt-1">
              Continue to the merchant store for purchase; TryVora does not process payment
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}
