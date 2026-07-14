//merchant management page, list of merchants, add merchant, edit merchant, delete merchant
//merchant management page, list of merchants, add merchant, edit merchant, delete merchant
"use client";

import { merchants } from "../../data/merchants";
import Image from "next/image";
import { useState } from "react";

export default function MerchantPage() {
    const [merchantList, setMerchantList] = useState(merchants);
    const [showForm, setShowForm] = useState(false);
    const [selectedMerchant, setSelectedMerchant] = useState<any>(null);

  return (
    <div>


      <div className="grid grid-cols-1 gap-4">
        {merchants.map((merchant) => (
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




