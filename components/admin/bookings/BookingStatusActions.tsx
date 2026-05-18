"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Status = "PENDING" | "CONFIRMED" | "ASSIGNED" | "COMPLETED" | "CANCELLED";

export default function BookingStatusActions({
  bookingId,
  currentStatus,
}: {
  bookingId: string;
  currentStatus: Status;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<Status | null>(null);

  const updateStatus = async (status: Status) => {
    try {
      setIsLoading(status);

      const response = await fetch("/api/admin/bookings/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, status }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Something went wrong");
      }

      router.refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setIsLoading(null);
    }
  };

  const buttons: Array<{ label: string; status: Status }> = [
    { label: "Confirm Booking", status: "CONFIRMED" },
    { label: "Mark Assigned", status: "ASSIGNED" },
    { label: "Mark Completed", status: "COMPLETED" },
    { label: "Cancel Booking", status: "CANCELLED" },
    { label: "Reset to Pending", status: "PENDING" },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {buttons.map((button) => (
        <button
          key={button.status}
          type="button"
          onClick={() => updateStatus(button.status)}
          disabled={isLoading !== null || currentStatus === button.status}
          className="rounded-2xl border border-[#8f6b2f] px-5 py-3 text-sm font-medium text-[#e3bd74] transition hover:bg-[#151008] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isLoading === button.status ? "Updating..." : button.label}
        </button>
      ))}
    </div>
  );
}