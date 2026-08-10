export default function Banner(){
  return(
      <div className="bg-gradient-to-r from-purple-700 to-gray-300 h-112 flex flex-row">
         <div className="text-left pl-35 mt-15">
          <h1 className="text-5xl font-semibold tracking-tight text-balance text-white sm:text-7xl ">Try Clothes <br />On your body <br />Before you buy</h1>
        <p className="pt-5 text-xl">AI-powered Digital Twin lets you preview outfits<br/>
             instantly. Experience the future of online shopping<br/> with hyper-realistic virtual try-ons</p>
        </div>
         <div className="flex items-center justify-center gap-6 mt-8">
  
            <img 
                src="image 3.png" 
                className="hidden md:block w-25 md:w-45 h-auto ml-50"
            />

            <img 
                src="image 2.png" 
                className="hidden md:block w-25 md:w-45 h-auto"
            />

        </div>

      </div>
  );
}