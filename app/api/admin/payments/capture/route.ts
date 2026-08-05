import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { PaymentStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

const ADMIN_SESSION_COOKIE = "soho_admin_session";

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get(ADMIN_SESSION_COOKIE);

    if (!session || session.value !== process.env.ADMIN_SESSION_SECRET) {
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
      typeof body.paymentId === "string" ? body.paymentId.trim() : "";

    if (!paymentId) {
      return NextResponse.json(
        {
          success: false,
          message: "Payment ID is required.",
        },
        { status: 400 }
      );
    }

    const payment = await prisma.payment.findUnique({
      where: {
        id: paymentId,
      },
      include: {
        booking: {
          include: {
            userProfile: true,
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

    /*
     * Safely handle repeated clicks or API retries.
     */
    if (payment.status === PaymentStatus.PAID) {
      return NextResponse.json({
        success: true,
        alreadyCaptured: true,
        message: "Payment has already been captured.",
        data: payment,
      });
    }

    if (payment.status !== PaymentStatus.AUTHORIZED) {
      return NextResponse.json(
        {
          success: false,
          message: `Payment cannot be captured while its status is ${payment.status}.`,
        },
        { status: 400 }
      );
    }

    if (!payment.paymentIntentId) {
      return NextResponse.json(
        {
          success: false,
          message: "Stripe PaymentIntent ID is missing.",
        },
        { status: 400 }
      );
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(
      payment.paymentIntentId
    );

    /*
     * Stripe may already have captured the payment even if our database update
     * previously failed. Reconcile that state instead of attempting capture again.
     */
    if (paymentIntent.status === "succeeded") {
      const reconciledPayment = await prisma.payment.update({
        where: {
          id: payment.id,
        },
        data: {
          status: PaymentStatus.PAID,
          paidAt: payment.paidAt || new Date(),
          transactionId:
            typeof paymentIntent.latest_charge === "string"
              ? paymentIntent.latest_charge
              : payment.transactionId,
        },
      });

      return NextResponse.json({
        success: true,
        reconciled: true,
        message: "Payment was already captured in Stripe and has been synchronized.",
        data: reconciledPayment,
      });
    }

    if (paymentIntent.status === "canceled") {
      const cancelledPayment = await prisma.payment.update({
        where: {
          id: payment.id,
        },
        data: {
          status: PaymentStatus.CANCELLED,
          cancelledAt: payment.cancelledAt || new Date(),
        },
      });

      return NextResponse.json(
        {
          success: false,
          message:
            "This authorization has already been cancelled or has expired.",
          data: cancelledPayment,
        },
        { status: 400 }
      );
    }

    if (paymentIntent.status !== "requires_capture") {
      return NextResponse.json(
        {
          success: false,
          message: `Stripe payment is not ready for capture. Current status: ${paymentIntent.status}.`,
        },
        { status: 400 }
      );
    }

    const capturedPaymentIntent = await stripe.paymentIntents.capture(
      payment.paymentIntentId,
      {},
      {
        idempotencyKey: `capture-payment-${payment.id}`,
      }
    );

    if (capturedPaymentIntent.status !== "succeeded") {
      console.error("STRIPE_CAPTURE_UNEXPECTED_STATUS", {
        paymentId: payment.id,
        paymentIntentId: payment.paymentIntentId,
        status: capturedPaymentIntent.status,
      });

      return NextResponse.json(
        {
          success: false,
          message: `Stripe capture did not complete successfully. Current status: ${capturedPaymentIntent.status}.`,
        },
        { status: 400 }
      );
    }

    const updatedPayment = await prisma.payment.update({
      where: {
        id: payment.id,
      },
      data: {
        status: PaymentStatus.PAID,
        paidAt: new Date(),
        transactionId:
          typeof capturedPaymentIntent.latest_charge === "string"
            ? capturedPaymentIntent.latest_charge
            : payment.transactionId,
      },
    });

    console.log("STRIPE_PAYMENT_CAPTURED", {
      paymentId: updatedPayment.id,
      bookingId: payment.bookingId,
      paymentIntentId: payment.paymentIntentId,
      amount: updatedPayment.amount,
      customerPhone: payment.booking.userProfile.phone,
    });

    return NextResponse.json({
      success: true,
      message: "Payment captured successfully.",
      data: updatedPayment,
    });
  } catch (error) {
    console.error("ADMIN_CAPTURE_PAYMENT_ERROR", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong while capturing the payment.",
      },
      { status: 500 }
    );
  }
}