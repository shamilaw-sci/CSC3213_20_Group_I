"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { X, User, UserCheck } from "lucide-react";
import Link from "next/link";


export default function garmentPreviewPage(){
    const [selectedGarment, setSelectedGarment] = useState<any>(null);
    const [garments, setGarments] = useState<any[]>([]);
    const [error, setError] = useState("");
    useEffect(() => { void (async () => { try { const response = await fetch('/api/garments'); if (!response.ok) throw new Error((await response.json()).error); setGarments(await response.json()); } catch (e) { setError(e instanceof Error ? e.message : 'Could not load garments.'); } })(); }, []);

    return(
        <div>
            <div>
                {error && <p className="rounded bg-red-50 p-3 text-red-700">{error}</p>}
                <div>
                    <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
                        {garments.map((garment) => (
                            <div key={garment.garmentId} 
                            onClick={() => setSelectedGarment(garment)}>
                                <Image
                                    src={garment.garmentImage}
                                    alt={garment.garmentId}
                                    width={200}
                                    height={200}
                                    className="w-[200px] h-[200px] shadow rounded-2xl object-cover transition duration-600 ease-in-out hover:scale-125"
                                />
                            </div>
                            
                        ))}
                        {/* Modal Call */}
                        {GarmentModal({ garment: selectedGarment, onClose: () => setSelectedGarment(null) })}
                    </div>
                </div>

            </div>

        </div>
        
        
    )
}

function GarmentModal({ garment, onClose }: any) {
  if (!garment) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

    <div className="bg-black/900 text-white rounded-lg p-6 w-[400px] relative shadow-lg">

        {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2"
                >
                    <X className="text-white" />
                </button>

        {/* Image */}
        <Image
          src={garment.garmentImage}
          alt={garment.garmentId}
          width={300}
          height={300}
          className="rounded mb-4"
        />

        {/* Details */}
        <h2 className="text-xl font-bold">{garment.garmentId}</h2>
        <p className="italic">Merchant: {garment.merchant}</p>
        
        <span >
            {garment.role === "Registered User" && (
                <div className="inline-flex items-center gap-1">
                <UserCheck size={16} className="text-white" />
                <span> {garment.role}</span>
                </div>
                )
            }
            {garment.role === "Guest User" && (
                <div className="inline-flex items-center gap-1">
                <User size={16} className="text-white" />
                <span> {garment.role}</span>
                </div>
                )}
        </span>
        <Link
          href="/admin/catalog/garmentpreview"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-black px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-800"
        >
         See More.. 
        </Link>

      </div>
    </div>
  );
}
