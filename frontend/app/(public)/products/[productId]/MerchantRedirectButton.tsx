"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/features/auth/context/AuthContext";

type MerchantRedirectButtonProps = {
  productId: string;
};

export default function MerchantRedirectButton({ productId }: MerchantRedirectButtonProps) {
  const { user, ready } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [registrationPrompt, setRegistrationPrompt] = useState(false);

  useEffect(() => {
    if (!user || typeof window === "undefined") return;
    const pendingProductId = window.sessionStorage.getItem("tryvora-pending-merchant-redirect");
    if (pendingProductId !== productId) return;
    window.sessionStorage.removeItem("tryvora-pending-merchant-redirect");
    void visitMerchant(true);
  // Resume a merchant redirect after account registration returns to this product.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, productId]);

  async function visitMerchant(resumingAfterRegistration = false) {
    if (!user) {
      setRegistrationPrompt(true);
      return;
    }
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

      if (resumingAfterRegistration) window.location.assign(data.redirectUrl);
      else window.open(data.redirectUrl, "_blank", "noopener,noreferrer");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not open merchant store.");
    } finally {
      setLoading(false);
    }
  }

  function registerToContinue() {
    window.sessionStorage.setItem("tryvora-pending-merchant-redirect", productId);
    router.push(`/register?returnTo=${encodeURIComponent(`/products/${productId}`)}`);
  }

  return (
    <div className="mt-8">
      <button
        type="button"
        onClick={() => void visitMerchant()}
        disabled={!ready || loading}
        className="inline-flex w-full justify-center rounded-xl bg-indigo-600 px-5 py-3 font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        {!ready ? "Checking account..." : loading ? "Opening merchant store..." : "Visit Merchant Store"}
      </button>
      {registrationPrompt && !user && <div className="mt-3 rounded-xl border border-indigo-100 bg-indigo-50 p-4"><p className="text-sm font-semibold text-indigo-950">Register to continue to the merchant store. You can keep browsing as a guest.</p><div className="mt-3 flex flex-wrap gap-2"><button type="button" onClick={registerToContinue} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">Register and continue</button><button type="button" onClick={() => setRegistrationPrompt(false)} className="rounded-lg border border-indigo-200 bg-white px-4 py-2 text-sm font-semibold text-indigo-800 hover:bg-indigo-100">Continue browsing</button></div></div>}
      {error && <p className="mt-3 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
    </div>
  );
}
