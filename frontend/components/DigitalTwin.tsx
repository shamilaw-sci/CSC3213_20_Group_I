/** WBS-2.x | Owner: S/21/063 | Branch: feature/s21-063-profile-digital-twin | Scope: Profile, Digital Twin, storage and privacy. */
import Link from "next/link";

export default function DigitalTwin() {
  return (
    <div className="bg-gradient-to-r from-blue-400 to-purple-600 py-20 px-6">

      <div className="max-w-2xl mx-auto text-center">

        
        <h2 className="text-4xl md:text-5xl font-bold text-white mt-20">
          Create Your Digital Twin Today

        </h2>

        
        <p className="mt-4 text-lg text-white">
          Join thousands of fashion enthusiasts experiencing the future <br/>of online shopping


        </p>

        
        <div className="mt-8 mb-10  ">
          <Link href="/profile" className="inline-block px-6 py-3 border border-white text-white rounded-lg hover:bg-blue-600 hover:text-white transition">
            Get Started
          </Link>
        </div>

      </div>

    </div>
  );
}
