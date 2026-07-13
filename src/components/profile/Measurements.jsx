"use client";

import { useState } from "react";


export default function Measurements(){


const [fitScore, setFitScore] = useState(null);
const [selectedSize, setSelectedSize] = useState("M");



const calculateFitScore = () => {


  // User body measurements
  const user = {
    chest:70,
    waist:50,
    hips:70
  };


  // Selected garment measurements
  const garment = {
    chest:90,
    waist:70,
    hips:96
  };



  let score = 100;



  const chestEase =
  garment.chest - user.chest;


  const waistEase =
  garment.waist - user.waist;


  const hipEase =
  garment.hips - user.hips;



  // Check fitting range

  if(chestEase < 15 || chestEase > 30)
  {
    score -= 15;
  }


  if(waistEase < 15 || waistEase > 30)
  {
    score -= 15;
  }


  if(hipEase < 20 || hipEase > 35)
  {
    score -= 15;
  }



  setFitScore(score);

};




return(

<div>



<h2 className="text-2xl font-bold text-black mb-4">
Realtime Sizing Avatar
</h2>



<p className="text-gray-600 mb-6">
Calibrate your exact measurements to get accurate sizes across brands.
</p>





{/* Avatar Section */}

<div className="
border
rounded-xl
p-6
mb-6
">


<h3 className="text-xl font-semibold mb-4">
Interactive Twin Model
</h3>



<div className="grid md:grid-cols-2 gap-6">



{/* 3D Avatar */}

<div
className="
h-80
bg-gray-100
rounded-xl
flex
flex-col
items-center
justify-center
"
>


<p className="text-6xl">
👤
</p>


<p className="font-semibold mt-3">
3D Silhouette
</p>


<div className="flex gap-3 mt-5">

<button className="bg-green-200 px-3 py-2 rounded">
Perfect Ease
</button>


<button className="bg-yellow-200 px-3 py-2 rounded">
Loose Fit
</button>


<button className="bg-red-200 px-3 py-2 rounded">
Tight Fit
</button>


</div>


</div>





{/* Score */}

<div>


<h3 className="font-semibold">
Fit Compatibility Score
</h3>



<p className="text-5xl font-bold text-violet-600 mt-4">

{
fitScore ? `${fitScore}%` : "--"
}

</p>



<p className="mt-4">
Size {selectedSize} recommendation
</p>



<button
onClick={calculateFitScore}
className="
mt-5
bg-violet-600
text-white
px-5
py-3
rounded-lg
"
>

Calculate Fit

</button>


</div>



</div>


</div>







{/* Measurements */}

<div className="
border
rounded-xl
p-6
">


<h3 className="text-xl font-semibold mb-4">
Body Measurements (cm)
</h3>




<div className="grid md:grid-cols-2 gap-4">


<input
value="Height: 140 cm"
readOnly
className="border p-3 rounded-lg text-black"
/>



<input
value="Weight: 40 kg"
readOnly
className="border p-3 rounded-lg text-black"
/>



<input
value="Chest Circumference: 70 cm"
readOnly
className="border p-3 rounded-lg text-black"
/>



<input
value="Garment Chest: 90 cm (+20 cm ease)"
readOnly
className="border p-3 rounded-lg text-black"
/>



<input
value="Waist Circumference: 50 cm"
readOnly
className="border p-3 rounded-lg text-black"
/>



<input
value="Garment Waist: 70 cm (+20 cm ease)"
readOnly
className="border p-3 rounded-lg text-black"
/>



<input
value="Hips Circumference: 70 cm"
readOnly
className="border p-3 rounded-lg text-black"
/>



<input
value="Garment Hips: 96 cm (+26 cm ease)"
readOnly
className="border p-3 rounded-lg text-black"
/>



<input
value="Shoulder Width: 44 cm"
readOnly
className="border p-3 rounded-lg text-black"
/>


</div>


</div>







{/* Try On */}

<div className="
border
rounded-xl
p-6
mt-6
">


<h3 className="text-xl font-semibold">
Currently Fitting Over Twin:
</h3>


<p className="mt-3 font-semibold">
Aura Silk Wrap Dress
</p>


<p>
Brand: Aura Atelier
</p>




<h4 className="mt-5">
Change Try-On Size
</h4>


<div className="flex gap-3 mt-3">


{
["S","M","L","XL"].map(size=>(

<button

key={size}

onClick={()=>setSelectedSize(size)}

className={`
px-5
py-2
border
rounded-lg
${
selectedSize===size
?
"bg-violet-600 text-white"
:
""
}
`}

>

{size}

</button>


))

}


</div>



<p className="mt-4">
Fits chest loose, waist loose!
</p>


</div>








{/* Recommendations */}

<div className="
border
rounded-xl
p-6
mt-6
">


<h3 className="text-xl font-semibold">
Smart Size Profile Recommendations
</h3>



<p className="text-gray-600 mt-2">
Based on your dynamic measurements, we automated your best size across brands.
</p>



<div className="space-y-3 mt-5">


<div className="border p-4 rounded-lg flex justify-between">
<span>Aura Silk Wrap Dress</span>
<span>S - 57% fit</span>
</div>



<div className="border p-4 rounded-lg flex justify-between">
<span>Metis Heavyweight Tee</span>
<span>S - 50% fit</span>
</div>



<div className="border p-4 rounded-lg flex justify-between">
<span>Suede Cafe Racer Jacket</span>
<span>S - 50% fit</span>
</div>



</div>


</div>




</div>

);

}