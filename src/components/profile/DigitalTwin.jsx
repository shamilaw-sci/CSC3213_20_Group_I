
"use client";

import { useRef, useState } from "react";

export default function DigitalTwin() {

  const fileInputRef = useRef(null);

  const [photo, setPhoto] = useState(null);
  const [twinCreated, setTwinCreated] = useState(false);

  // ===============================
  // Choose Photo
  // ===============================

  const handleChoosePhoto = () => {
    fileInputRef.current.click();
  };


  // ===============================
  // Handle Photo Upload
  // ===============================

  const handleFileChange = (event) => {

    const file = event.target.files[0];

    if (file) {

      const imageURL = URL.createObjectURL(file);

      setPhoto(imageURL);
      setTwinCreated(false);

    }

  };


  // ===============================
  // Generate Twin
  // ===============================

  const generateTwin = () => {

    setTwinCreated(true);

  };


  // ===============================
  // Close Preview
  // ===============================

  const closePreview = () => {

    setTwinCreated(false);

  };


  return (

    <div>

      {/* =====================================
          PAGE HEADER
      ====================================== */}

      <h2 className="text-2xl font-bold text-black mb-2">
        Your Digital Twin
      </h2>

      <p className="text-gray-600 mb-6">
        Upload a full-body photo for the most accurate virtual try-on results.
        We recommend wearing fitted clothing in good lighting.
      </p>


      {/* =====================================
          MAIN CONTENT
          LEFT = PHOTO
          RIGHT = GUIDELINES
      ====================================== */}

      <div className="grid md:grid-cols-2 gap-8">


        {/* =====================================
            LEFT SIDE - PROFILE PHOTO
        ====================================== */}

        <div className="border rounded-2xl p-6 bg-white shadow-sm">

          <h3 className="text-lg font-semibold text-black mb-4">
            Profile Photo
          </h3>


          {/* Upload Area */}

          <div
            className="
              border-2
              border-dashed
              border-gray-300
              rounded-2xl
              h-80
              flex
              flex-col
              items-center
              justify-center
              bg-gray-50
              overflow-hidden
            "
          >

            {photo ? (

              <img
                src={photo}
                alt="Uploaded profile"
                className="
                  h-64
                  max-w-full
                  rounded-xl
                  object-contain
                "
              />

            ) : (

              <>

                <div className="
                  w-16
                  h-16
                  rounded-full
                  bg-violet-100
                  flex
                  items-center
                  justify-center
                  text-3xl
                ">
                  📷
                </div>

                <p className="text-gray-600 mt-4">
                  No photo uploaded
                </p>

             
                <p className="text-gray-400 text-sm mt-1 text-center">
                  <span className="font-semibold text-gray-500">
                   PNG, JPG or JPEG (MAX. 10MB)
                  </span>
                  
                  
                </p>



              </>

            )}


            {/* Hidden File Input */}

            <input
              type="file"
              accept="image/png,image/jpeg"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />


          </div>


          {/* Choose Photo */}

          <button
            onClick={handleChoosePhoto}
            className="
              w-full
              mt-5
              bg-violet-600
              hover:bg-violet-700
              text-white
              px-5
              py-3
              rounded-xl
              font-medium
              transition
            "
          >

            {photo ? "Change Photo" : "Choose Photo"}

          </button>


          {/* Generate Twin */}

          {photo && (

            <button
              onClick={generateTwin}
              className="
                w-full
                mt-3
                bg-black
                hover:bg-gray-800
                text-white
                px-6
                py-3
                rounded-xl
                font-medium
                transition
              "
            >

              ✨ Generate Digital Twin

            </button>

          )}

        </div>



        {/* =====================================
            RIGHT SIDE - PHOTO GUIDELINES
        ====================================== */}

        <div
          className="
            rounded-2xl
            bg-black
            text-white
            p-6
            shadow-xl
          "
        >

          {/* Header */}

          <div className="flex items-center gap-3 mb-6">

            <div
              className="
                w-11
                h-11
                rounded-xl
                bg-violet-600
                flex
                items-center
                justify-center
                text-xl
              "
            >
              ✨
            </div>

            <div>

              <h3 className="text-lg font-semibold">
                Photo Guidelines
              </h3>

              <p className="text-gray-400 text-sm">
                Get better results with these tips
              </p>

            </div>

          </div>


          {/* Guidelines */}

          <div className="space-y-4">


            {/* Guideline 1 */}

            <div
              className="
                flex
                items-center
                gap-4
                p-4
                rounded-xl
                bg-gray-900
                border
                border-gray-800
              "
            >

              <div
                className="
                  w-10
                  h-10
                  rounded-full
                  bg-green-500/20
                  text-green-400
                  flex
                  items-center
                  justify-center
                  font-bold
                  text-lg
                "
              >
                ✓
              </div>

              <div>

                <p className="font-medium">
                  Stand Straight
                </p>

                <p className="text-sm text-gray-400">
                  Face the camera directly
                </p>

              </div>

            </div>



            {/* Guideline 2 */}

            <div
              className="
                flex
                items-center
                gap-4
                p-4
                rounded-xl
                bg-gray-900
                border
                border-gray-800
              "
            >

              <div
                className="
                  w-10
                  h-10
                  rounded-full
                  bg-green-500/20
                  text-green-400
                  flex
                  items-center
                  justify-center
                  font-bold
                  text-lg
                "
              >
                ✓
              </div>

              <div>

                <p className="font-medium">
                  Wear Fitted Clothing
                </p>

                <p className="text-sm text-gray-400">
                  Avoid loose or bulky clothes
                </p>

              </div>

            </div>



            {/* Guideline 3 */}

            <div
              className="
                flex
                items-center
                gap-4
                p-4
                rounded-xl
                bg-gray-900
                border
                border-gray-800
              "
            >

              <div
                className="
                  w-10
                  h-10
                  rounded-full
                  bg-green-500/20
                  text-green-400
                  flex
                  items-center
                  justify-center
                  font-bold
                  text-lg
                "
              >
                ✓
              </div>

              <div>

                <p className="font-medium">
                  Good Lighting
                </p>

                <p className="text-sm text-gray-400">
                  Make sure your body is clearly visible
                </p>

              </div>

            </div>



            {/* Guideline 4 */}

            <div
              className="
                flex
                items-center
                gap-4
                p-4
                rounded-xl
                bg-gray-900
                border
                border-gray-800
              "
            >

              <div
                className="
                  w-10
                  h-10
                  rounded-full
                  bg-green-500/20
                  text-green-400
                  flex
                  items-center
                  justify-center
                  font-bold
                  text-lg
                "
              >
                ✓
              </div>

              <div>

                <p className="font-medium">
                  Plain Background
                </p>

                <p className="text-sm text-gray-400">
                  Use a clean background
                </p>

              </div>

            </div>

          </div>


          {/* Bottom Tip */}

          <div
            className="
              mt-5
              p-4
              rounded-xl
              bg-violet-500/10
              border
              border-violet-500/20
            "
          >

            <p className="text-sm text-violet-200">
              💡 Keep your entire body visible in the photo
              for better measurement accuracy.
            </p>

          </div>

        </div>

      </div>



      {/* =====================================
          DIGITAL TWIN POPUP
      ====================================== */}

      {twinCreated && (

        <div
          className="
            fixed
            inset-0
            z-50
            bg-black/70
            backdrop-blur-sm
            flex
            items-center
            justify-center
            p-4
          "
          onClick={closePreview}
        >

          {/* Popup */}

          <div
            className="
              relative
              w-full
              max-w-2xl
              bg-white
              rounded-2xl
              shadow-2xl
              p-6
            "
            onClick={(e) => e.stopPropagation()}
          >

            {/* Close Button */}

            <button
              onClick={closePreview}
              className="
                absolute
                top-4
                right-4
                w-9
                h-9
                rounded-full
                bg-gray-100
                hover:bg-gray-200
                text-gray-700
                flex
                items-center
                justify-center
                text-lg
              "
            >
              ✕
            </button>


            {/* Popup Header */}

            <h3 className="text-xl font-bold text-black">
              Interactive Twin Model
            </h3>

            <p className="text-gray-500 text-sm mt-1">
              Your Digital Twin preview
            </p>


            {/* Preview */}

            <div
              className="
                mt-5
                h-96
                rounded-xl
                bg-gray-100
                flex
                items-center
                justify-center
              "
            >

              <div className="text-center">

                <div className="text-8xl">
                  👤
                </div>

                <p className="mt-4 font-semibold text-lg">
                  3D Avatar Created
                </p>

                <p className="text-gray-500 text-sm mt-1">
                  Your digital twin is ready
                </p>

              </div>

            </div>


            {/* Popup Buttons */}

            <div className="flex gap-3 mt-5">

              <button
                onClick={closePreview}
                className="
                  flex-1
                  border
                  border-gray-300
                  py-3
                  rounded-xl
                  font-medium
                  text-black
                "
              >
                Close
              </button>

              <button
                className="
                  flex-1
                  bg-violet-600
                  hover:bg-violet-700
                  text-white
                  py-3
                  rounded-xl
                  font-medium
                "
              >
                Continue
              </button>

            </div>

          </div>

        </div>

      )}

    </div>

  );
}

