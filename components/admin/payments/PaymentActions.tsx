"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type PaymentStatus =
  | "PENDING"
  | "AUTHORIZED"
  | "PAID"
  | "CANCELLED"
  | "FAILED"
  | "REFUNDED";

type PendingAuthorization = {
  id: string;
  additionalAmount: number;
  reason: string | null;
  createdAt: string;
  expiresAt: string;
};

export default function PaymentActions({
  bookingId,
  sourcePaymentId,
  currentStatus,
  totalAuthorizedAmount,
  pendingAuthorization,
}: {
  bookingId: string;
  sourcePaymentId: string;
  currentStatus: PaymentStatus;
  totalAuthorizedAmount: number;
  pendingAuthorization: PendingAuthorization | null;
}) {
  const router = useRouter();

  const [finalAmount, setFinalAmount] = useState(
    totalAuthorizedAmount.toFixed(2)
  );
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isCancellingRequest, setIsCancellingRequest] = useState(false);

  const numericFinalAmount = useMemo(() => {
    const parsedAmount = Number(finalAmount);

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      return 0;
    }

    return Number(parsedAmount.toFixed(2));
  }, [finalAmount]);

  const releaseAmount = Math.max(
    0,
    Number((totalAuthorizedAmount - numericFinalAmount).toFixed(2))
  );

  const additionalAmount = Math.max(
    0,
    Number((numericFinalAmount - totalAuthorizedAmount).toFixed(2))
  );

  const requiresAdditionalAuthorization =
    numericFinalAmount > totalAuthorizedAmount;

  const isInvalidAmount = numericFinalAmount <= 0;

  /*
   * Do not allow the existing authorization to be captured while an
   * additional authorization request is still waiting for the customer.
   * The admin should either update/resend or remove the pending request.
   */
  const captureBlockedByPendingRequest =
    Boolean(pendingAuthorization) && !requiresAdditionalAuthorization;

  const submit = async () => {
    if (isInvalidAmount) {
      alert("Please enter a valid final service amount.");
      return;
    }

    if (captureBlockedByPendingRequest) {
      alert(
        "An additional authorization request is still pending. Remove that request before capturing the existing authorization."
      );
      return;
    }

    const confirmationMessage = requiresAdditionalAuthorization
      ? pendingAuthorization
        ? `Update the pending request to an additional $${additionalAmount.toFixed(
            2
          )} and resend the same secure link?`
        : `Send the customer an authorization request for an additional $${additionalAmount.toFixed(
            2
          )}?`
      : releaseAmount > 0
        ? `Capture $${numericFinalAmount.toFixed(
            2
          )} and release the remaining $${releaseAmount.toFixed(
            2
          )} authorization?`
        : `Capture all authorized payments totaling $${numericFinalAmount.toFixed(
            2
          )}?`;

    if (!window.confirm(confirmationMessage)) {
      return;
    }

    try {
      setIsSubmitting(true);

      const endpoint = requiresAdditionalAuthorization
        ? "/api/admin/payments/request-additional-authorization"
        : "/api/admin/payments/capture-all";

      const requestBody = requiresAdditionalAuthorization
        ? {
            paymentId: sourcePaymentId,
            finalAmount: numericFinalAmount,
            reason: reason.trim(),
          }
        : {
            bookingId,
            finalAmount: numericFinalAmount,
            reason: reason.trim(),
          };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            (requiresAdditionalAuthorization
              ? "Unable to send the authorization request."
              : "Unable to capture the authorized payments.")
        );
      }

      alert(
        result.message ||
          (requiresAdditionalAuthorization
            ? "Authorization request sent successfully."
            : "Authorized payments captured successfully.")
      );

      setReason("");
      router.refresh();
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const resendPendingAuthorization = async () => {
    if (!pendingAuthorization) {
      return;
    }

    try {
      setIsResending(true);

      const response = await fetch(
        "/api/admin/payments/resend-additional-authorization",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            requestId: pendingAuthorization.id,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Unable to resend the authorization link."
        );
      }

      alert(result.message || "Authorization link resent successfully.");
      router.refresh();
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Something went wrong while resending the link."
      );
    } finally {
      setIsResending(false);
    }
  };

  const cancelPendingAuthorization = async () => {
    if (!pendingAuthorization) {
      return;
    }

    const confirmed = window.confirm(
      `Remove the pending additional authorization request for $${pendingAuthorization.additionalAmount.toFixed(
        2
      )}? The existing link will stop working.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setIsCancellingRequest(true);

      const response = await fetch(
        "/api/admin/payments/cancel-additional-authorization",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            requestId: pendingAuthorization.id,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Unable to remove the authorization request."
        );
      }

      alert(result.message || "Authorization request removed.");
      router.refresh();
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Something went wrong while removing the request."
      );
    } finally {
      setIsCancellingRequest(false);
    }
  };

  if (
    currentStatus !== "AUTHORIZED" ||
    totalAuthorizedAmount <= 0
  ) {
    return null;
  }

  const isBusy =
    isSubmitting || isResending || isCancellingRequest;

  return (
    <div className="border-t border-amber-500/20 pt-5">
      <div className="rounded-[22px] border border-amber-500/30 bg-amber-500/10 p-5">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-amber-400/40 bg-amber-400/10 text-lg text-amber-300">
            $
          </div>

          <div>
            <p className="text-sm font-semibold text-amber-200">
              Authorizations ready for capture
            </p>

            <p className="mt-2 text-xs leading-6 text-amber-100/70">
              Enter the final service amount. You may capture less than the
              authorized total, capture it in full, or request an additional
              authorization from the customer.
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-[#2f291d] bg-[#0f0f0f] p-4">
          <p className="text-[11px] uppercase tracking-[0.2em] text-[#8f8778]">
            Total Active Authorization
          </p>

          <p className="mt-2 font-serif text-3xl text-white">
            ${totalAuthorizedAmount.toFixed(2)}
          </p>

          <p className="mt-2 text-xs leading-6 text-[#8f8778]">
            Includes the original and any approved additional authorizations
            that have not yet been captured.
          </p>
        </div>

        <div className="mt-5">
          <label
            htmlFor="final-service-amount"
            className="mb-2 block text-sm font-medium text-[#d8d0c1]"
          >
            Final Service Amount
          </label>

          <div className="flex overflow-hidden rounded-2xl border border-[#2f291d] bg-[#111111] focus-within:border-[#d6ab5f]">
            <span className="flex items-center border-r border-[#2f291d] px-4 text-sm text-[#d6ab5f]">
              $
            </span>

            <input
              id="final-service-amount"
              type="number"
              min="0.01"
              step="0.01"
              inputMode="decimal"
              value={finalAmount}
              onChange={(event) => setFinalAmount(event.target.value)}
              disabled={isBusy}
              className="w-full bg-transparent px-4 py-3 text-white outline-none disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>

          {isInvalidAmount && finalAmount !== "" && (
            <p className="mt-2 text-xs text-red-300">
              Enter an amount greater than $0.00.
            </p>
          )}
        </div>

        <div className="mt-5">
          <label
            htmlFor="payment-adjustment-reason"
            className="mb-2 block text-sm font-medium text-[#d8d0c1]"
          >
            Adjustment Reason{" "}
            <span className="font-normal text-[#8f8778]">
              (Optional)
            </span>
          </label>

          <textarea
            id="payment-adjustment-reason"
            rows={3}
            maxLength={500}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            disabled={isBusy}
            placeholder="Example: Customer requested additional work, fewer rooms were cleaned, or a discount was approved."
            className="w-full resize-none rounded-2xl border border-[#2f291d] bg-[#111111] px-4 py-3 text-white outline-none placeholder:text-[#6f675b] focus:border-[#d6ab5f] disabled:cursor-not-allowed disabled:opacity-60"
          />

          <p className="mt-2 text-right text-[11px] text-[#6f675b]">
            {reason.length}/500
          </p>
        </div>

        {!isInvalidAmount && releaseAmount > 0 && (
          <div className="mt-5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4">
            <p className="text-sm font-semibold text-emerald-300">
              Reduced final amount
            </p>

            <p className="mt-2 text-xs leading-6 text-emerald-200/80">
              ${numericFinalAmount.toFixed(2)} will be captured. The remaining $
              {releaseAmount.toFixed(2)} authorization will be released.
            </p>
          </div>
        )}

        {!isInvalidAmount &&
          numericFinalAmount === totalAuthorizedAmount && (
            <div className="mt-5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4">
              <p className="text-sm font-semibold text-emerald-300">
                Full authorization will be captured
              </p>

              <p className="mt-2 text-xs leading-6 text-emerald-200/80">
                All active authorizations totaling $
                {totalAuthorizedAmount.toFixed(2)} will be captured.
              </p>
            </div>
          )}

        {!isInvalidAmount && additionalAmount > 0 && (
          <div className="mt-5 rounded-2xl border border-sky-500/30 bg-sky-500/10 p-4">
            <p className="text-sm font-semibold text-sky-300">
              Customer approval required
            </p>

            <p className="mt-2 text-xs leading-6 text-sky-200/80">
              The final amount exceeds the current authorization by $
              {additionalAmount.toFixed(2)}. The customer will receive an SMS
              containing a secure link to authorize the difference.
            </p>

            {pendingAuthorization && (
              <p className="mt-2 text-xs leading-6 text-sky-200/70">
                The existing pending request will be updated and the same secure
                link will be resent.
              </p>
            )}
          </div>
        )}

        {captureBlockedByPendingRequest && (
          <div className="mt-5 rounded-2xl border border-orange-500/30 bg-orange-500/10 p-4">
            <p className="text-sm font-semibold text-orange-300">
              Additional authorization still pending
            </p>

            <p className="mt-2 text-xs leading-6 text-orange-200/80">
              Remove the pending request before capturing the currently
              authorized amount.
            </p>
          </div>
        )}

        <button
          type="button"
          onClick={submit}
          disabled={
            isBusy ||
            isInvalidAmount ||
            captureBlockedByPendingRequest
          }
          className={`mt-6 flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${
            requiresAdditionalAuthorization
              ? "bg-blue-600 hover:bg-blue-500"
              : "bg-emerald-600 hover:bg-emerald-500"
          }`}
        >
          {isSubmitting && (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          )}

          {isSubmitting
            ? requiresAdditionalAuthorization
              ? pendingAuthorization
                ? "Updating and Resending..."
                : "Sending Authorization Link..."
              : "Capturing All Payments..."
            : requiresAdditionalAuthorization
              ? pendingAuthorization
                ? `Update Request to $${additionalAmount.toFixed(2)} & Resend`
                : `Send Link for Additional $${additionalAmount.toFixed(2)}`
              : `Capture All — $${numericFinalAmount.toFixed(2)}`}
        </button>

        <p className="mt-3 text-center text-[11px] leading-5 text-amber-100/50">
          {requiresAdditionalAuthorization
            ? "No existing authorization will be captured until the additional amount has been approved."
            : captureBlockedByPendingRequest
              ? "The pending authorization request must be removed before capture."
              : releaseAmount > 0
                ? "Stripe will capture the final amount and release every unused authorization."
                : "This action will capture all active authorizations for this booking."}
        </p>

        {pendingAuthorization && (
          <div className="mt-5 rounded-2xl border border-sky-500/30 bg-sky-500/10 p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-sky-200">
                  A link for authorization of an additional $
                  {pendingAuthorization.additionalAmount.toFixed(2)} has been
                  sent to the customer.
                </p>

                <p className="mt-2 text-xs leading-6 text-sky-200/70">
                  Sent{" "}
                  {formatDateTime(pendingAuthorization.createdAt)} · Expires{" "}
                  {formatDateTime(pendingAuthorization.expiresAt)}
                </p>

                {pendingAuthorization.reason && (
                  <p className="mt-2 line-clamp-3 whitespace-pre-line text-xs leading-6 text-sky-100/60">
                    {pendingAuthorization.reason}
                  </p>
                )}
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={resendPendingAuthorization}
                  disabled={isBusy}
                  className="rounded-xl border border-sky-400/40 px-3 py-2 text-xs font-medium text-sky-200 transition hover:bg-sky-400/10 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isResending ? "Resending..." : "Resend"}
                </button>

                <button
                  type="button"
                  onClick={cancelPendingAuthorization}
                  disabled={isBusy}
                  aria-label="Remove pending authorization request"
                  title="Remove pending request"
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-rose-500/40 text-sm text-rose-300 transition hover:bg-rose-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isCancellingRequest ? "…" : "✕"}
                </button>
              </div>
            </div>

            <p className="mt-3 text-[11px] leading-5 text-sky-100/50">
              This message disappears automatically after the customer
              completes the authorization.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function formatDateTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return date.toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}