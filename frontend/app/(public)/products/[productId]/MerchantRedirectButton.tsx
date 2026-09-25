"use client";

import { useState } from "react";

type MerchantRedirectButtonProps = {
  productId: string;
};

export default function MerchantRedirectButton({ productId }: MerchantRedirectButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function visitMerchant() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/v1/redirects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, source: "product_detail" }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message ?? "Could not open merchant store.");
      }

      window.open(data.redirectUrl, "_blank", "noopener,noreferrer");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not open merchant store.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-8">
      <button
        type="button"
        onClick={() => void visitMerchant()}
        disabled={loading}
        className="inline-flex w-full justify-center rounded-xl bg-indigo-600 px-5 py-3 font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        {loading ? "Opening merchant store..." : "Visit Merchant Store"}
      </button>
      {error && <p className="mt-3 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
    </div>
  );
}
