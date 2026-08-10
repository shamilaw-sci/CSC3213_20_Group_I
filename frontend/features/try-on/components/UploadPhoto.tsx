"use client";


import { Upload, X } from "lucide-react";


interface Props {

  preview?: string | null;

  onUpload:(file:File)=>void;

  onRemove:()=>void;

}



export default function UploadPhoto({
  preview,
  onUpload,
  onRemove,

}:Props){



const handleChange = (
 e:React.ChangeEvent<HTMLInputElement>
)=>{


 const file=e.target.files?.[0];


 if(file){
   onUpload(file);
 }

};



return (

<div>


{
preview ? (

<div
className="
relative
aspect-[4/5]
rounded-2xl
overflow-hidden
bg-gray-100
"
>


<img
src={preview}
alt="User"
className="
w-full
h-full
object-cover
"
/>


<button
onClick={onRemove}
className="
absolute
top-3
right-3
bg-white
rounded-full
p-2
shadow
"
>

<X size={18}/>

</button>


</div>


):(


<label
className="
aspect-[4/5]
border-2
border-dashed
border-indigo-300
rounded-2xl
flex
flex-col
items-center
justify-center
cursor-pointer
hover:bg-indigo-50
"
>


<Upload
size={45}
className="text-indigo-600 mb-4"
/>


<p className="font-semibold">
Upload Full Body Photo
</p>


<p className="text-gray-400 text-sm">
PNG / JPG
</p>



<input
type="file"
accept="image/png,image/jpeg"
className="hidden"
onChange={handleChange}
/>


</label>


)

}


</div>

);

}