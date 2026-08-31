"use client";


import { Loader2 } from "lucide-react";


export default function LoadingState(){


return (

<div
className="
flex
items-center
justify-center
gap-3
py-5
text-indigo-600
font-semibold
"
>

<Loader2
size={22}
className="animate-spin"
/>


Generating AI Try On...


</div>

);


}
