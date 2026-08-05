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
      "Are you sure you want to capture this payment? The customer's card will be charged."
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
          : "Something went wrong while capturing payment."
      );
    } finally {
      setIsCapturing(false);
    }
  };

  if (currentStatus !== "AUTHORIZED") {
    return null;
  }

  return (
    <div className="mt-5 border-t border-[#2f291d] pt-5">
      <div className="rounded-2xl border border-[#8f6b2f]/50 bg-[#151008] p-4">
        <p className="text-sm font-medium text-[#e3bd74]">
          Card authorized — payment has not been captured yet.
        </p>

        <p className="mt-2 text-xs leading-6 text-[#a99e8c]">
          Capture the payment after the cleaning service has been completed.
          This action will charge the customer&apos;s card.
        </p>

        <button
          type="button"
          onClick={capturePayment}
          disabled={isCapturing}
          className="mt-4 w-full rounded-2xl bg-[#d6ab5f] px-5 py-3 text-sm font-semibold text-black transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isCapturing ? "Capturing Payment..." : "Capture Payment"}
        </button>
      </div>
    </div>
  );
}