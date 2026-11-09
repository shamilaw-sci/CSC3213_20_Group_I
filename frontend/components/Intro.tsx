import Link from "next/link";
import Image from "next/image";

export default function SplitSection() {
  return (
    <div className="w-full bg-white py-16 px-6 md:px-20">

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12">

        
        <div className="flex-1">

          <h2 className="text-4xl md:text-7xl font-bold bg-gradient-to-r from-blue-800 via-blue-700 to-pink-600 bg-clip-text text-transparent">
            See the Magic <br/> Yourself
          </h2>

          <p className="mt-6 text-lg text-gray-600 leading-relaxed">
            Our AI preserves your unique features while<br/> accurately rendering how clothes fit and drape on<br/> your body. Choose an outfit to open the Try-On preview
          </p>

          
          <ul className="mt-6 space-y-3 text-gray-700">

            <li className="flex items-start gap-2">
              <span className="text-green-500 font-bold">✔</span>
              Skin tone matching with 98% accuracy
            </li>

            <li className="flex items-start gap-2">
              <span className="text-green-500 font-bold">✔</span>
              Real-time fabric simulation
            </li>

            <li className="flex items-start gap-2">
              <span className="text-green-500 font-bold">✔</span>
              Perfect proportion rendering
            </li>

            <li className="flex items-start gap-2">
              <span className="text-green-500 font-bold">✔</span>
              Natural lighting adjustment
            </li>

          </ul>
          <Link href="/explore" className="mt-8 inline-block rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-700">Try an Outfit</Link>

        </div>

       
        <div className="flex-1 flex justify-center">
          <Image
            src="/image 5.png"
            width={500}
            height={600}
            alt="Illustration of a virtual outfit preview"
            className="w-full max-w-sm md:max-w-md h-auto rounded-xl shadow-lg"
          />
        </div>

      </div>
    </div>
  );
}
