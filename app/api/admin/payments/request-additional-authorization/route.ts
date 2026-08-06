import { randomBytes } from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  AdditionalAuthorizationStatus,
  PaymentStatus,
} from "@prisma/client";

import { prisma } from "@/lib/prisma";
import {
  getAdditionalAuthorizationSmsBody,
  sendSms,
} from "@/lib/twilio";

const ADMIN_SESSION_COOKIE = "soho_admin_session";
const REQUEST_EXPIRY_HOURS = 24;
const REASON_SEPARATOR = "\n\n------------------------\n\n";

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get(ADMIN_SESSION_COOKIE);

    if (
      !session ||
      session.value !== process.env.ADMIN_SESSION_SECRET
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized.",
        },
        { status: 401 }
      );
    }

    const body = await req.json();

    const paymentId =
      typeof body.paymentId === "string"
        ? body.paymentId.trim()
        : "";

    const finalAmount = Number(body.finalAmount);

    const reason =
      typeof body.reason === "string"
        ? body.reason.trim()
        : "";

    if (!paymentId) {
      return NextResponse.json(
        {
          success: false,
          message: "Payment ID is required.",
        },
        { status: 400 }
      );
    }

    if (
      !Number.isFinite(finalAmount) ||
      finalAmount <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please enter a valid final service amount.",
        },
        { status: 400 }
      );
    }

    const normalizedFinalAmount = Number(
      finalAmount.toFixed(2)
    );

    const payment = await prisma.payment.findUnique({
      where: {
        id: paymentId,
      },
      include: {
        booking: {
          include: {
            userProfile: true,
            payments: {
              orderBy: {
                createdAt: "asc",
              },
            },
            additionalAuthorizations: {
              orderBy: {
                createdAt: "desc",
              },
            },
          },
        },
      },
    });

    if (!payment) {
      return NextResponse.json(
        {
          success: false,
          message: "Payment not found.",
        },
        { status: 404 }
      );
    }

    if (
      payment.status !== PaymentStatus.AUTHORIZED
    ) {
      return NextResponse.json(
        {
          success: false,
          message: `Additional authorization cannot be requested while the payment status is ${payment.status}.`,
        },
        { status: 400 }
      );
    }

    const now = new Date();

    /*
     * Expire any old pending requests before checking whether an active
     * request can be reused.
     */
    await prisma.additionalAuthorization.updateMany({
      where: {
        bookingId: payment.bookingId,
        status:
          AdditionalAuthorizationStatus.PENDING,
        expiresAt: {
          lte: now,
        },
      },
      data: {
        status:
          AdditionalAuthorizationStatus.EXPIRED,
      },
    });

    /*
     * Include both active authorizations and amounts already captured.
     * A new request is only needed for the amount above this total.
     */
    const totalAuthorizedAmount = Number(
      payment.booking.payments
        .filter(
          (bookingPayment) =>
            bookingPayment.status ===
              PaymentStatus.AUTHORIZED ||
            bookingPayment.status ===
              PaymentStatus.PAID
        )
        .reduce(
          (total, bookingPayment) =>
            total +
            bookingPayment.authorizedAmount,
          0
        )
        .toFixed(2)
    );

    if (
      normalizedFinalAmount <= totalAuthorizedAmount
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "The final amount does not exceed the amount already authorized. You can capture the required amount directly.",
        },
        { status: 400 }
      );
    }

    const additionalAmount = Number(
      (
        normalizedFinalAmount -
        totalAuthorizedAmount
      ).toFixed(2)
    );

    const existingPendingRequest =
      payment.booking.additionalAuthorizations.find(
        (request) =>
          request.status ===
            AdditionalAuthorizationStatus.PENDING &&
          request.expiresAt > now
      );

    const expiresAt = new Date(
      Date.now() +
        REQUEST_EXPIRY_HOURS * 60 * 60 * 1000
    );

    let authorizationRequest:
      | Awaited<
          ReturnType<
            typeof prisma.additionalAuthorization.create
          >
        >
      | Awaited<
          ReturnType<
            typeof prisma.additionalAuthorization.update
          >
        >;

    let wasUpdated = false;

    if (existingPendingRequest) {
      const mergedReason = mergeReasons(
        existingPendingRequest.reason,
        reason
      );

      authorizationRequest =
        await prisma.additionalAuthorization.update({
          where: {
            id: existingPendingRequest.id,
          },
          data: {
            additionalAmount,
            reason: mergedReason,
            paymentId: payment.id,
            expiresAt,
          },
        });

      wasUpdated = true;
    } else {
      authorizationRequest =
        await prisma.additionalAuthorization.create({
          data: {
            bookingId: payment.bookingId,
            paymentId: payment.id,
            token: randomBytes(32).toString("hex"),
            additionalAmount,
            reason: reason || null,
            status:
              AdditionalAuthorizationStatus.PENDING,
            expiresAt,
          },
        });
    }

    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      "http://localhost:3000";

    const authorizationLink =
      `${appUrl}/authorize-additional/${authorizationRequest.token}`;

    const smsSent = await sendSms({
      to: payment.booking.userProfile.phone,
      body: getAdditionalAuthorizationSmsBody({
        additionalAmount,
        finalAmount: normalizedFinalAmount,
        reason:
          authorizationRequest.reason || undefined,
        authorizationLink,
        expiresInHours: REQUEST_EXPIRY_HOURS,
      }),
    });

    /*
     * Preserve the request even if Twilio fails. The admin can resend the
     * same secure URL later.
     */
    if (!smsSent) {
      console.error(
        "ADDITIONAL_AUTHORIZATION_SMS_FAILED",
        {
          requestId: authorizationRequest.id,
          bookingId: payment.bookingId,
          phone:
            payment.booking.userProfile.phone,
          wasUpdated,
        }
      );

      return NextResponse.json(
        {
          success: false,
          requestCreated: !wasUpdated,
          requestUpdated: wasUpdated,
          message: wasUpdated
            ? "The pending authorization request was updated, but the SMS could not be sent."
            : "The authorization request was created, but the SMS could not be sent.",
          data: {
            requestId:
              authorizationRequest.id,
            authorizationLink,
            additionalAmount,
            currentAuthorizedAmount:
              totalAuthorizedAmount,
            finalAmount:
              normalizedFinalAmount,
            expiresAt:
              authorizationRequest.expiresAt,
          },
        },
        { status: 502 }
      );
    }

    console.log(
      wasUpdated
        ? "ADDITIONAL_AUTHORIZATION_REQUEST_UPDATED"
        : "ADDITIONAL_AUTHORIZATION_REQUEST_CREATED",
      {
        requestId: authorizationRequest.id,
        bookingId: payment.bookingId,
        sourcePaymentId: payment.id,
        currentlyAuthorized:
          totalAuthorizedAmount,
        additionalAmount,
        finalAmount:
          normalizedFinalAmount,
        reason:
          authorizationRequest.reason || null,
        expiresAt:
          authorizationRequest.expiresAt,
        tokenReused: wasUpdated,
      }
    );

    return NextResponse.json({
      success: true,
      updatedExistingRequest: wasUpdated,
      message: wasUpdated
        ? `The pending authorization request has been updated to $${additionalAmount.toFixed(
            2
          )}, and the same secure link was resent to the customer.`
        : `An authorization link for an additional $${additionalAmount.toFixed(
            2
          )} has been sent to the customer.`,
      data: {
        requestId: authorizationRequest.id,
        additionalAmount,
        currentAuthorizedAmount:
          totalAuthorizedAmount,
        finalAmount:
          normalizedFinalAmount,
        expiresAt:
          authorizationRequest.expiresAt,
      },
    });
  } catch (error) {
    console.error(
      "REQUEST_ADDITIONAL_AUTHORIZATION_ERROR",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Something went wrong while requesting additional authorization.",
      },
      { status: 500 }
    );
  }
}

function mergeReasons(
  existingReason: string | null,
  newReason: string
) {
  const current = existingReason?.trim() || "";
  const incoming = newReason.trim();

  if (!incoming) {
    return current || null;
  }

  if (!current) {
    return incoming;
  }

  /*
   * Avoid appending the exact same note repeatedly when an admin resends
   * the request without changing its reason.
   */
  if (
    current
      .toLowerCase()
      .includes(incoming.toLowerCase())
  ) {
    return current;
  }

  return `${current}${REASON_SEPARATOR}${incoming}`;
}