"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DocumentReuploadAction({
  professionalId,
}: {
  professionalId: string;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const requestReupload = async () => {
    const confirmed = confirm(
      "Send ID document reupload request to this professional?"
    );

    if (!confirmed) return;

    try {
      setIsLoading(true);

      const response = await fetch(
        "/api/admin/professionals/request-document-reupload",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            professionalId,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Something went wrong");
      }

      alert("Document reupload request sent successfully.");
      router.refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={requestReupload}
      disabled={isLoading}
      className="w-full rounded-2xl border border-[#8f6b2f] px-5 py-3 text-sm font-medium text-[#e3bd74] transition hover:bg-[#151008] disabled:cursor-not-allowed disabled:opacity-50"
    >
      {isLoading ? "Sending Request..." : "Request ID Reupload"}
    </button>
  );
}