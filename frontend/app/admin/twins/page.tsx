//digital twin monitoring page, list of twins, add twin, edit twin, delete twin
"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { X ,User, UserCheck } from 'lucide-react';

export default function Twinspage(){
    const [selectedTwin, setSelectedTwin] = useState<any>(null);
    const [twins, setTwins] = useState<any[]>([]);
    const [error, setError] = useState("");
    useEffect(() => { void (async () => { try { const response = await fetch('/api/twins'); if (!response.ok) throw new Error((await response.json()).error); setTwins(await response.json()); } catch (e) { setError(e instanceof Error ? e.message : 'Could not load digital twins.'); } })(); }, []);

    return(
        <div>

            <div>
                <h2 className="items-center justify-center text-3xl font-bold mb-4 p-7">Digital Twin Monitor</h2>
                {error && <p className="rounded bg-red-50 p-3 text-red-700">{error}</p>}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-7">
                <div className="bg-gradient-to-br from-purple-200 via-pink-200 to-pink-100 p-4 hover:-translate-y-2 hover:shadow-2xl shadow-xl rounded-2xl transition duration-800 w-80">
                    <h3 className="text-xl font-serif text-center py-2 p-4">Total Digital Twins Created</h3>
                    <p className="font-serif text-center text-4xl">~ 234</p>
                </div>
                <div className="bg-gradient-to-br from-pink-200 via-pink-100 to-purple-100 p-4 hover:-translate-y-2 hover:shadow-2xl shadow-xl rounded-2xl transition duration-800 w-80">
                    <h3 className="text-xl font-serif text-center py-2">Total Image Uploaded</h3>
                    <p className="font-serif text-center text-4xl">~ 789</p>
                </div>
                <div className="bg-gradient-to-br from-purple-100 via-purple-200 to-pink-100 p-4 hover:-translate-y-2 hover:shadow-2xl shadow-xl rounded-2xl transition duration-800 w-80">
                    <h3 className="text-xl font-serif text-center py-2">Storage Consumption</h3>
                    <p className="font-serif text-center text-4xl">~ 1.2 GB</p>
                </div>
                </div>
            </div>

            <div>
                <div>
                    <h1 className="text-2xl font-bold mb-4">Digital Twins</h1>

                    <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
                        {twins.map((twin) => (
                            <div key={twin.twinId} 
                            onClick={() => setSelectedTwin(twin)}>
                                <Image
                                    src={twin.image}
                                    alt={twin.name}
                                    width={200}
                                    height={200}
                                    className="w-[200px] h-[200px] shadow rounded-2xl object-cover transition duration-600 ease-in-out hover:scale-125"
                                />
                            </div>
                            
                        ))}
                        {/* Modal Call */}
                        {TwinModal({ twin: selectedTwin, onClose: () => setSelectedTwin(null) })}
                    </div>
                </div>

            </div>

        </div>
        
        
    )
}

function TwinModal({ twin, onClose }: any) {
  if (!twin) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

    <div className="bg-black/70 text-white rounded-lg p-6 w-[400px] relative shadow-lg">

        {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2"
                >
                    <X className="text-white" />
                </button>

        {/* Image */}
        <Image
          src={twin.image}
          alt={twin.twinId}
          width={300}
          height={300}
          className="rounded mb-4"
        />

        {/* Details */}
        <h2 className="text-xl font-bold">{twin.name}</h2>
        <p className="italic">Email: {twin.email}</p>
        <span >
            {twin.role === "Registered User" && (
                <div className="inline-flex items-center gap-1">
                <UserCheck size={16} className="text-white" />
                <span> {twin.role}</span>
                </div>
                )
            }
            {twin.role === "Guest User" && (
                <div className="inline-flex items-center gap-1">
                <User size={16} className="text-white" />
                <span> {twin.role}</span>
                </div>
                )}
        </span>

      </div>
    </div>
  );
}
