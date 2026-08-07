"use client";


import { TryOnResult } from "../types/tryon";


interface Props{

 result:TryOnResult;

}



export default function ResultPreview({
 result,

}:Props){


return (

<div className="mt-8">


<h3
className="
font-semibold
text-lg
mb-3
"
>
AI Result Preview
</h3>


<div
className="
max-w-sm
aspect-[4/5]
rounded-2xl
overflow-hidden
"
>


<img

src={result.image}

alt="AI Result"

className="
w-full
h-full
object-cover
"

/>


</div>


</div>

);


}