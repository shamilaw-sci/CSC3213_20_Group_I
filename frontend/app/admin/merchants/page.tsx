"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type Merchant = { id: string; name: string; email: string; storeName: string; status: string; products: number; image: string | null };

export default function MerchantPage() {
    const [merchantList, setMerchantList] = useState<Merchant[]>([]);
    const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(null);
    const [error, setError] = useState("");
    useEffect(() => { void (async () => { try { const response = await fetch('/api/merchants'); if (!response.ok) throw new Error((await response.json()).error); setMerchantList(await response.json()); } catch (e) { setError(e instanceof Error ? e.message : 'Could not load merchants.'); } })(); }, []);

  return (
    <div>


      <div className="grid grid-cols-1 gap-4">
        {error && <p className="rounded bg-red-50 p-3 text-red-700">{error}</p>}
        {merchantList.map((merchant) => (
          <div
            key={merchant.id}
            className="flex items-center gap-4 bg-white p-4 rounded shadow cursor-pointer hover:shadow-lg transition"
            onClick={() => setSelectedMerchant(merchant)}
          >
            <Image
              src={merchant.image || "/images/merchants/default.jpg"}
              alt={merchant.name}
              width={50}
              height={50}
              className="rounded mb-2"
            />

            <div className="grid grid-cols-4 flex-1 items-center gap-4">
        
                {/* Column: Store Name */}
                <div>

                  <h2 className="font-semibold">{merchant.storeName}</h2>
                </div>

                {/* Column: Merchant Name */}
                <div>
                  <p className="text-sm text-gray-600">{merchant.name}</p>
                </div>

                 {/* Column: Products */}
                <div>
                  
                 <p className="text-sm">{merchant.products} Products</p>
                </div>

                {/* Column: Status */}
                <div className="text-right">
                  <span
                   className={`px-2 py-1 rounded inline-block ${
                      merchant.status === "Active"
                       ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                    >
                    {merchant.status}
                  </span>
                </div>
        
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}



