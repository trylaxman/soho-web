"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type PaymentStatus =
  | "PENDING"
  | "AUTHORIZED"
  | "PAID"
  | "CANCELLED"
  | "FAILED"
  | "REFUNDED";

export default function PaymentActions({
  paymentId,
  currentStatus,
}: {
  paymentId: string;
  currentStatus: PaymentStatus;
}) {
  const router = useRouter();
  const [isCapturing, setIsCapturing] = useState(false);

  const capturePayment = async () => {
    const confirmed = window.confirm(
      "Capture this payment now? The authorized amount will be charged to the customer's card."
    );

    if (!confirmed) {
      return;
    }

    try {
      setIsCapturing(true);

      const response = await fetch("/api/admin/payments/capture", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paymentId,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to capture payment.");
      }

      alert(result.message || "Payment captured successfully.");
      router.refresh();
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Something went wrong while capturing the payment."
      );
    } finally {
      setIsCapturing(false);
    }
  };

  if (currentStatus !== "AUTHORIZED") {
    return null;
  }

  return (
    <div className="border-t border-amber-500/20 pt-5">
      <div className="rounded-[22px] border border-amber-500/30 bg-amber-500/10 p-5">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-amber-400/40 bg-amber-400/10 text-lg text-amber-300">
            $
          </div>

          <div>
            <p className="text-sm font-semibold text-amber-200">
              Authorization ready for capture
            </p>

            <p className="mt-2 text-xs leading-6 text-amber-100/70">
              The customer&apos;s card is authorized and the funds are currently
              on hold. Capture the payment only after the cleaning service has
              been completed.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={capturePayment}
          disabled={isCapturing}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isCapturing && (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          )}

          {isCapturing ? "Capturing Payment..." : "Capture Payment"}
        </button>

        <p className="mt-3 text-center text-[11px] leading-5 text-amber-100/50">
          This action will charge the authorized amount to the customer&apos;s
          card.
        </p>
      </div>
    </div>
  );
}