export default function Measurements(){

return(

<div>

<h2 className="text-2xl font-bold text-black mb-4">
Body Measurements
</h2>


<p className="text-gray-600 mb-6">
Optional measurements to improve fit accuracy.
</p>


<div className="grid md:grid-cols-2 gap-4">


<input
placeholder="Height (cm)"
className="border border-black rounded-lg p-3 text-black"
/>


<input
placeholder="Weight (kg)"
className="border border-black rounded-lg p-3 text-black"
/>


<input
placeholder="Chest (cm)"
className="border border-black rounded-lg p-3 text-black"
/>


<input
placeholder="Waist (cm)"
className="border border-black rounded-lg p-3 text-black"
/>


<input
placeholder="Hip (cm)"
className="border border-black rounded-lg p-3 text-black"
/>


<input
placeholder="Shoulder Width (cm)"
className="border border-black rounded-lg p-3 text-black"
/>


</div>


<button className="mt-6 bg-violet-600 text-white px-6 py-3 rounded-lg">
Save Measurements
</button>


</div>

)

}