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
  // Calculate Fit Score
  // ===============================
  const calculateFitScore = () => {

    const user = {
      chest: body.chest,
      waist: body.waist,
      hips: body.hips,
    };

    // Example garment
    const garment = {
      chest: 90,
      waist: 70,
      hips: 96,
    };

    const chestEase = garment.chest - user.chest;
    const waistEase = garment.waist - user.waist;
    const hipEase = garment.hips - user.hips;

    let score = 100;

    if (chestEase < 15 || chestEase > 30) score -= 15;
    if (waistEase < 15 || waistEase > 30) score -= 15;
    if (hipEase < 20 || hipEase > 35) score -= 15;

    setFitScore(score);
  };

  return (

    <div className="space-y-6">{
      /* ===========================
          Interactive Twin Model
      ============================ */}

      <div className="border rounded-xl p-6 bg-white shadow-sm">

        <h2 className="text-2xl font-bold text-black">
          Interactive Twin Model
        </h2>

        <p className="text-gray-500 mt-1 mb-6">
          Calibrate your exact measurements to get accurate sizes across brands.
        </p>

        <div className="grid lg:grid-cols-2 gap-8">

          {/* Avatar */}
          <div className="flex flex-col items-center">

            <Avatar body={body} />

            <h3 className="font-semibold text-lg mt-4">
              3D Silhouette
            </h3>

            <div className="flex gap-2 mt-4">

              <span className="bg-green-100 text-green-700 text-sm px-3 py-1 rounded-full">
                Perfect Ease
              </span>

              <span className="bg-yellow-100 text-yellow-700 text-sm px-3 py-1 rounded-full">
                Loose Fit
              </span>

              <span className="bg-red-100 text-red-700 text-sm px-3 py-1 rounded-full">
                Tight Fit
              </span>

            </div>

            <div className="flex gap-6 mt-5 text-sm font-medium">

              <span>
                H: {body.height} cm
              </span>

              <span>
                W: {body.weight} kg
              </span>

            </div>

          </div>

          {/* Fit Score */}
          <div className="flex flex-col justify-center">

            <h3 className="text-xl font-semibold">
              Fit Compatibility Score
            </h3>

            <p className="text-6xl font-bold text-violet-600 mt-5">

              {fitScore === null ? "--" : `${fitScore}%`}

            </p>

            <p className="mt-4 text-gray-600">

              Size

              <span className="font-bold text-black mx-1">
                {selectedSize}
              </span>

              recommendation is

              <span className="font-semibold text-violet-600 ml-1">
                Strict Alignment Advisory
              </span>

            </p>

            <button

              onClick={calculateFitScore}

              className="
                mt-8
                bg-violet-600
                hover:bg-violet-700
                text-white
                px-6
                py-3
                rounded-lg
                transition
              "

            >

              Calculate Fit

            </button>

          </div>

        </div>

      </div>
            {/* ===========================
          Body Measurements
      ============================ */}

      <div className="border rounded-xl p-6 bg-white shadow-sm">

        <h2 className="text-2xl font-bold">
          Body Measurements (cm)
        </h2>

        <p className="text-gray-500 mt-2 mb-6">
          Calibrate your exact measurements to get accurate sizes across brands.
        </p>

        {/* Gender */}

        <div className="flex gap-3 mb-8">

          <button className="px-4 py-2 rounded-full bg-violet-600 text-white">
            Female
          </button>

          <button className="px-4 py-2 rounded-full border">
            Male
          </button>

          <button className="px-4 py-2 rounded-full border">
            Unisex
          </button>

        </div>

        <div className="space-y-6">

          {/* Height */}

          <div>

            <div className="flex justify-between mb-2">
              <span className="font-medium">Height</span>
              <span>{body.height} cm</span>
            </div>

            <input
              type="range"
              min="140"
              max="210"
              value={body.height}
              onChange={(e)=>
                setBody({
                  ...body,
                  height:Number(e.target.value)
                })
              }
              className="w-full"
            />

          </div>

          {/* Weight */}

          <div>

            <div className="flex justify-between mb-2">
              <span className="font-medium">Weight</span>
              <span>{body.weight} kg</span>
            </div>

            <input
              type="range"
              min="40"
              max="120"
              value={body.weight}
              onChange={(e)=>
                setBody({
                  ...body,
                  weight:Number(e.target.value)
                })
              }
              className="w-full"
            />

          </div>

          {/* Chest */}

          <div>

            <div className="flex justify-between mb-2">
              <span className="font-medium">
                Chest Circumference
              </span>

              <span>{body.chest} cm</span>

            </div>

            <input
              type="range"
              min="70"
              max="130"
              value={body.chest}
              onChange={(e)=>
                setBody({
                  ...body,
                  chest:Number(e.target.value)
                })
              }
              className="w-full"
            />

            <p className="text-sm text-gray-500 mt-2">
              Garment Chest: 90 cm (+20 cm ease)
            </p>

          </div>

          {/* Waist */}

          <div>

            <div className="flex justify-between mb-2">
              <span className="font-medium">
                Waist Circumference
              </span>

              <span>{body.waist} cm</span>

            </div>

            <input
              type="range"
              min="50"
              max="120"
              value={body.waist}
              onChange={(e)=>
                setBody({
                  ...body,
                  waist:Number(e.target.value)
                })
              }
              className="w-full"
            />

            <p className="text-sm text-gray-500 mt-2">
              Garment Waist: 70 cm (+20 cm ease)
            </p>

          </div>

          {/* Hips */}

          <div>

            <div className="flex justify-between mb-2">
              <span className="font-medium">
                Hips Circumference
              </span>

              <span>{body.hips} cm</span>

            </div>

            <input
              type="range"
              min="70"
              max="140"
              value={body.hips}
              onChange={(e)=>
                setBody({
                  ...body,
                  hips:Number(e.target.value)
                })
              }
              className="w-full"
            />

            <p className="text-sm text-gray-500 mt-2">
              Garment Hips: 96 cm (+26 cm ease)
            </p>

          </div>

          {/* Shoulder */}

          <div>

            <div className="flex justify-between mb-2">
              <span className="font-medium">
                Shoulder Width
              </span>

              <span>{body.shoulder} cm</span>

            </div>

            <input
              type="range"
              min="35"
              max="60"
              value={body.shoulder}
              onChange={(e)=>
                setBody({
                  ...body,
                  shoulder:Number(e.target.value)
                })
              }
              className="w-full"
            />

          </div>

          {/* Skin Tone */}

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
              ].map((color)=>(

                <button

                  key={color}

                  onClick={()=>
                    setBody({
                      ...body,
                      skinColor:color
                    })
                  }

                  className={`w-8 h-8 rounded-full border-2 ${
                    body.skinColor===color
                      ? "border-violet-600"
                      : "border-gray-300"
                  }`}

                  style={{
                    backgroundColor:color
                  }}

                />

              ))}

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}