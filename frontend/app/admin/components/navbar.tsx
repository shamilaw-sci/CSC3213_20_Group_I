"use client";
import Link from "next/link";
import {Search,UserCircle} from "lucide-react";

export default function Navbar(){
    return(
        <div className="w-full flex items-center justify-between bg-white px-6 py-3 shadow-sm">
            
            {/*search box*/}
            <div className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-md w-1/3">
                <Search size={18} className="text-gray-500" />
                <input
                    type="text"
                    placeholder="Search..."
                    className="bg-transparent outline-none w-full"
                />
            </div>

            {/* Profile Icon */}
            
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <Link href="/adminprofile" className="inline-flex items-center justify-center gap-2 rounded-full bg-purple-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-purple-800">
                    <UserCircle size={26}/> Admin Profile
                </Link>
            </div>
        </div>
    )
}

    