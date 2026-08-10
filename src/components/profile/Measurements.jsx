
"use client";

import { useState } from "react";
import Avatar from "@/components/profile/Avatar";

export default function Measurements() {

  // ===============================
  // Body Measurements State
  // ===============================
  const [body, setBody] = useState({
    height: 140,
    weight: 40,
    chest: 70,
    waist: 50,
    hips: 70,
    shoulder: 44,
    skinColor: "#dfbeaa",
  });

  // ===============================
  // Fit Score
  // ===============================
  const [fitScore, setFitScore] = useState(null);

  // ===============================
  // Selected Garment Size
  // ===============================
  const [selectedSize, setSelectedSize] = useState("M");

  // ===============================
  // Gender
  // ===============================
  const [gender, setGender] = useState("Female");

  // ===============================
  // Calculate Fit Score
  // ===============================
  const calculateFitScore = () => {

    const garment = {
      chest: 90,
      waist: 70,
      hips: 96,
    };

    const chestEase = garment.chest - body.chest;
    const waistEase = garment.waist - body.waist;
    const hipEase = garment.hips - body.hips;

    let score = 100;

    if (chestEase < 15 || chestEase > 30) {
      score -= 15;
    }

    if (waistEase < 15 || waistEase > 30) {
      score -= 15;
    }

    if (hipEase < 20 || hipEase > 35) {
      score -= 15;
    }

    setFitScore(score);
  };

  return (

    <div className="space-y-6">

      {/* =========================================
          MAIN SECTION
          LEFT = AVATAR
          RIGHT = MEASUREMENTS
      ========================================== */}

      <div className="grid lg:grid-cols-2 gap-8">

        {/* =====================================
            LEFT SIDE - AVATAR
        ====================================== */}

        <div className="border rounded-xl p-6 bg-white shadow-sm">

          <h2 className="text-2xl font-bold text-black">
            Interactive Twin Model
          </h2>

          <p className="text-gray-500 mt-1 mb-6">
            Your personalized digital avatar.
          </p>


          {/* Avatar */}

          <div className="
            flex
            flex-col
            items-center
            justify-center
            min-h-[500px]
            bg-gray-50
            rounded-xl
          ">

            <Avatar body={body} />


            <h3 className="font-semibold text-lg mt-4 text-black">
              3D Silhouette
            </h3>


            {/* Fit Indicators */}

            <div className="flex gap-2 mt-4 flex-wrap justify-center">

              <span className="
                bg-green-100
                text-green-700
                text-sm
                px-3
                py-1
                rounded-full
              ">
                Perfect Ease
              </span>


              <span className="
                bg-yellow-100
                text-yellow-700
                text-sm
                px-3
                py-1
                rounded-full
              ">
                Loose Fit
              </span>


              <span className="
                bg-red-100
                text-red-700
                text-sm
                px-3
                py-1
                rounded-full
              ">
                Tight Fit
              </span>

            </div>


            {/* Height and Weight */}

            <div className="
              flex
              gap-8
              mt-5
              text-sm
              font-medium
            ">

              <span>
                H: {body.height} cm
              </span>

              <span>
                W: {body.weight} kg
              </span>

            </div>

          </div>

        </div>


        {/* =====================================
            RIGHT SIDE - BODY MEASUREMENTS
        ====================================== */}

        <div className="border rounded-xl p-6 bg-white shadow-sm text-black">

          <h2 className="text-2xl font-bold">
            Body Measurements (cm)
          </h2>

          <p className="text-gray-500 mt-2 mb-6 text-black">
            Calibrate your exact measurements to create your digital twin.
          </p>


          {/* =================================
              GENDER
          ================================== */}

          <div className="flex gap-3 mb-8">

            {["Female", "Male", "Unisex"].map((item) => (

              <button
                key={item}
                onClick={() => setGender(item)}
                className={`
                  px-4
                  py-2
                  rounded-full
                  border
                  transition

                  ${
                    gender === item
                      ? "bg-violet-600 text-white border-violet-600"
                      : "bg-white text-black border-gray-300"
                  }
                `}
              >

                {item}

              </button>

            ))}

          </div>


          <div className="space-y-6">


            {/* =================================
                HEIGHT
            ================================== */}

            <div>

              <div className="flex justify-between mb-2">

                <span className="font-medium">
                  Height
                </span>

                <span>
                  {body.height} cm
                </span>

              </div>


              <input
                type="range"
                min="140"
                max="210"
                value={body.height}
                onChange={(e) =>
                  setBody({
                    ...body,
                    height: Number(e.target.value)
                  })
                }
                className="w-full"
              />

            </div>



            {/* =================================
                WEIGHT
            ================================== */}

            <div>

              <div className="flex justify-between mb-2">

                <span className="font-medium">
                  Weight
                </span>

                <span>
                  {body.weight} kg
                </span>

              </div>


              <input
                type="range"
                min="40"
                max="120"
                value={body.weight}
                onChange={(e) =>
                  setBody({
                    ...body,
                    weight: Number(e.target.value)
                  })
                }
                className="w-full"
              />

            </div>



            {/* =================================
                CHEST
            ================================== */}

            <div>

              <div className="flex justify-between mb-2">

                <span className="font-medium">
                  Chest Circumference
                </span>

                <span>
                  {body.chest} cm
                </span>

              </div>


              <input
                type="range"
                min="70"
                max="130"
                value={body.chest}
                onChange={(e) =>
                  setBody({
                    ...body,
                    chest: Number(e.target.value)
                  })
                }
                className="w-full"
              />


              <p className="text-sm text-gray-500 mt-2">
                Garment Chest: 90 cm (+20 cm ease)
              </p>

            </div>



            {/* =================================
                WAIST
            ================================== */}

            <div>

              <div className="flex justify-between mb-2">

                <span className="font-medium">
                  Waist Circumference
                </span>

                <span>
                  {body.waist} cm
                </span>

              </div>


              <input
                type="range"
                min="50"
                max="120"
                value={body.waist}
                onChange={(e) =>
                  setBody({
                    ...body,
                    waist: Number(e.target.value)
                  })
                }
                className="w-full"
              />


              <p className="text-sm text-gray-500 mt-2">
                Garment Waist: 70 cm (+20 cm ease)
              </p>

            </div>



            {/* =================================
                HIPS
            ================================== */}

            <div>

              <div className="flex justify-between mb-2">

                <span className="font-medium">
                  Hips Circumference
                </span>

                <span>
                  {body.hips} cm
                </span>

              </div>


              <input
                type="range"
                min="70"
                max="140"
                value={body.hips}
                onChange={(e) =>
                  setBody({
                    ...body,
                    hips: Number(e.target.value)
                  })
                }
                className="w-full"
              />


              <p className="text-sm text-gray-500 mt-2">
                Garment Hips: 96 cm (+26 cm ease)
              </p>

            </div>



            {/* =================================
                SHOULDER
            ================================== */}

            <div>

              <div className="flex justify-between mb-2">

                <span className="font-medium">
                  Shoulder Width
                </span>

                <span>
                  {body.shoulder} cm
                </span>

              </div>


              <input
                type="range"
                min="35"
                max="60"
                value={body.shoulder}
                onChange={(e) =>
                  setBody({
                    ...body,
                    shoulder: Number(e.target.value)
                  })
                }
                className="w-full"
              />

            </div>



            {/* =================================
                SKIN TONE
            ================================== */}

            <div>

              <h4 className="font-medium mb-3">
                Skin Tone
              </h4>


              <div className="flex gap-3">

                {[
                  "#f7d7c4",
                  "#dfbeaa",
                  "#c58f70",
                  "#8c593c",
                  "#5a3825",
                ].map((color) => (

                  <button
                    key={color}

                    onClick={() =>
                      setBody({
                        ...body,
                        skinColor: color
                      })
                    }

                    className={`
                      w-8
                      h-8
                      rounded-full
                      border-2

                      ${
                        body.skinColor === color
                          ? "border-violet-600"
                          : "border-gray-300"
                      }
                    `}

                    style={{
                      backgroundColor: color
                    }}

                  />

                ))}

              </div>

            </div>


            {/* =================================
                CALCULATE BUTTON
            ================================== */}

            <button
              onClick={calculateFitScore}
              className="
                w-full
                mt-4
                bg-violet-600
                hover:bg-violet-700
                text-white
                px-6
                py-3
                rounded-lg
                transition
                font-medium
              "
            >

              Calculate Fit

            </button>

          </div>

        </div>

      </div>



      {/* =========================================
          FIT SCORE SECTION
      ========================================== */}

      <div className="
        border
        rounded-xl
        p-6
        bg-white
        shadow-sm
      ">

        <h2 className="text-xl font-semibold text-black">
          Fit Compatibility Score
        </h2>


        <p className="
          text-6xl
          font-bold
          text-violet-600
          mt-4
        ">

          {fitScore === null
            ? "--"
            : `${fitScore}%`
          }

        </p>


        <p className="mt-4 text-gray-600">

          Recommended Size:

          <span className="
            font-bold
            text-black
            ml-2
          ">

            {selectedSize}

          </span>

        </p>


        {/* Size Buttons */}

        <div className="flex gap-3 mt-4">

          {["S", "M", "L", "XL"].map((size) => (

            <button
              key={size}

              onClick={() => setSelectedSize(size)}

              className={`
                px-5
                py-2
                rounded-lg
                border

                ${
                  selectedSize === size
                    ? "bg-violet-600 text-white border-violet-600"
                    : "bg-white text-black border-gray-300"
                }
              `}
            >

              {size}

            </button>

          ))}

        </div>

      </div>

    </div>
  );
}

