import React from 'react'
import Image from 'next/image';

export default function ExplorePage() {
  return (
    <div className="min-h-screen bg-[#F8F9FB] p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        
        {/* Title Section */}
        <header className="mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Fashion Wardrobe</h1>
          <p className="text-gray-500 text-lg">Explore curated collections from top stores</p>
        </header>

        {/* Search & Filter Box */}
        <div className="bg-white p-6 rounded-[2rem] shadow-sm mb-12 border border-gray-100">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
              <input 
                type="text" 
                placeholder="Search for items or stores..." 
                className="w-full bg-gray-50 border-none rounded-2xl py-4 px-12 focus:ring-2 focus:ring-purple-400"
              />
            </div>
            <button className="flex items-center justify-center gap-2 px-6 py-3 border border-gray-200 rounded-2xl font-semibold hover:bg-gray-50">
              <span>⚙️</span> Filters
            </button>
          </div>

          {/* Categories */}
          <div className="flex gap-3 overflow-x-auto pb-2">
            {['All', 'Dresses', 'Tops', 'Bottoms', 'Accessories'].map((cat, index) => (
              <button key={cat} className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${index === 0 ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {cat}
              </button>
            ))}
            </div>
          </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">

        {/* මේක එක Card එකක code එකයි - මේ වගේ කිහිපයක් පාවිච්චි කරන්න */}
        <div className="group bg-white rounded-[2.5rem] p-4 shadow-sm hover:shadow-xl transition-all duration-300">
    
         {/* Image Container */}
        <div className="relative aspect-[3/4] bg-gray-100 rounded-[2rem] overflow-hidden mb-5">
        <span className="absolute top-4 left-4 bg-[#6366F1] text-white text-[10px] font-bold px-3 py-1 rounded-lg uppercase">Dresses</span>
        <button className="absolute top-4 right-4 p-2.5 bg-white/90 rounded-full shadow-sm text-gray-400 hover:text-red-500">❤️</button>
        <img src="photo-1622079401116-8317808352d9.jpg" alt="Dress" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        </div>

        {/* Product Info */}
        <div className="px-2 mb-6">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Fashion Hub</p>
          <h3 className="text-xl font-bold text-gray-800 mb-1">Elegant Evening Dress</h3>
          <p className="text-[#6366F1] font-extrabold text-2xl">$129.99</p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
           <button className="w-full py-4 bg-gradient-to-r from-[#6366F1] to-[#22D3EE] text-white rounded-2xl font-black text-sm shadow-lg shadow-indigo-100 uppercase italic tracking-tighter hover:opacity-90">
        Add to Cart
        </button>
           <button className="w-full py-3.5 border border-gray-100 rounded-2xl font-bold text-sm text-gray-500 hover:bg-gray-50 flex items-center justify-center gap-2">
           <span>✨</span> Try On
          </button>
        </div>
        </div>
        </div>
        
        </div>
      </div>
  );
}

