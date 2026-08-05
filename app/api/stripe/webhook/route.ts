import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import {
  BookingStatus,
  CleaningFrequency,
  CleaningType,
  PaymentStatus,
} from "@prisma/client";
import {
  calculateCleaningPrice,
  type CleaningType as PricingCleaningType,
  type HomeSize,
} from "@/lib/pricing/cleaning-pricing";
import { getBookingCreatedSmsBody, sendSms } from "@/lib/twilio";

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing Stripe signature.",
        },
        { status: 400 }
      );
    }

    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    /*
     * Booking creation still happens when Stripe Checkout completes.
     * Other Stripe events will be handled separately later.
     */
    if (event.type !== "checkout.session.completed") {
      return NextResponse.json({ received: true });
    }

    const session = event.data.object;
    const metadata = session.metadata;

    if (!metadata) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing checkout metadata.",
        },
        { status: 400 }
      );
    }

    if (typeof session.payment_intent !== "string") {
      return NextResponse.json(
        {
          success: false,
          message: "Missing Stripe PaymentIntent.",
        },
        { status: 400 }
      );
    }

    const paymentIntentId = session.payment_intent;

    /*
     * Stripe can retry webhook events, so check both unique identifiers.
     */
    const existingPayment = await prisma.payment.findFirst({
      where: {
        OR: [
          {
            checkoutSessionId: session.id,
          },
          {
            paymentIntentId,
          },
        ],
      },
      include: {
        booking: true,
      },
    });

    if (existingPayment) {
      console.log("STRIPE_WEBHOOK_DUPLICATE_SKIPPED", {
        checkoutSessionId: session.id,
        paymentIntentId,
        paymentId: existingPayment.id,
        bookingId: existingPayment.bookingId,
      });

      return NextResponse.json({
        received: true,
        duplicate: true,
      });
    }

    /*
     * Retrieve the PaymentIntent directly from Stripe instead of assuming
     * the authorization succeeded based only on Checkout completion.
     */
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    let paymentStatus: PaymentStatus;
    let authorizedAt: Date | null = null;
    let paidAt: Date | null = null;

    if (paymentIntent.status === "requires_capture") {
      paymentStatus = PaymentStatus.AUTHORIZED;
      authorizedAt = new Date();
    } else if (paymentIntent.status === "succeeded") {
      /*
       * Compatibility fallback in case an automatically captured payment
       * reaches this webhook during migration or testing.
       */
      paymentStatus = PaymentStatus.PAID;
      paidAt = new Date();
    } else {
      console.error("UNEXPECTED_PAYMENT_INTENT_STATUS", {
        checkoutSessionId: session.id,
        paymentIntentId,
        status: paymentIntent.status,
      });

      return NextResponse.json(
        {
          success: false,
          message: `Unexpected PaymentIntent status: ${paymentIntent.status}`,
        },
        { status: 400 }
      );
    }

    const pricing = calculateCleaningPrice({
      cleaningType: metadata.cleaningType as PricingCleaningType,
      homeSize: metadata.homeSize as HomeSize,
      totalSqft: Number(metadata.totalSqft),
    });

    const selectedAddOns = metadata.selectedAddOns
      ? metadata.selectedAddOns.split(",").filter(Boolean)
      : [];

    const addOnTotal = metadata.addOnTotal
      ? Number(metadata.addOnTotal)
      : 0;

    const calculatedTotal = Number(
      (pricing.total + addOnTotal).toFixed(2)
    );

    /*
     * Use Stripe's PaymentIntent amount as the authoritative payment amount.
     */
    const stripeAmount = Number((paymentIntent.amount / 100).toFixed(2));

    if (stripeAmount !== calculatedTotal) {
      console.warn("STRIPE_AMOUNT_MISMATCH", {
        paymentIntentId,
        stripeAmount,
        calculatedTotal,
      });
    }

    const user = await prisma.userProfile.upsert({
      where: {
        email: metadata.email,
      },
      update: {
        fullName: metadata.fullName,
        phone: metadata.phone,
        address: metadata.address,
        apartment: metadata.apartment,
        city: metadata.city,
        state: metadata.state,
        zipCode: metadata.zipCode,
      },
      create: {
        fullName: metadata.fullName,
        email: metadata.email,
        phone: metadata.phone,
        address: metadata.address,
        apartment: metadata.apartment,
        city: metadata.city,
        state: metadata.state,
        zipCode: metadata.zipCode,
      },
    });

    const booking = await prisma.booking.create({
      data: {
        userProfileId: user.id,

        cleaningType: metadata.cleaningType as CleaningType,
        homeSize: metadata.homeSize,

        bedrooms: metadata.bedrooms
          ? Number(metadata.bedrooms)
          : null,

        bathrooms: metadata.bathrooms
          ? Number(metadata.bathrooms)
          : null,

        kitchens: metadata.kitchens
          ? Number(metadata.kitchens)
          : null,

        hasPets: metadata.hasPets === "true",

        selectedAddOns,
        addOnTotal,

        preferredDate: metadata.preferredDate
          ? new Date(metadata.preferredDate)
          : null,

        preferredTime: metadata.preferredTime,

        frequency: metadata.frequency as CleaningFrequency,

        specialNotes: metadata.specialNotes,

        status: BookingStatus.PENDING,

        payments: {
          create: {
            amount: stripeAmount,
            currency: paymentIntent.currency.toUpperCase(),
            status: paymentStatus,
            provider: "STRIPE",

            checkoutSessionId: session.id,
            paymentIntentId,

            authorizedAt,
            paidAt,
          },
        },
      },
      include: {
        userProfile: true,
        payments: true,
      },
    });

    console.log("STRIPE_BOOKING_CREATED", {
      bookingId: booking.id,
      checkoutSessionId: session.id,
      paymentIntentId,
      paymentIntentStatus: paymentIntent.status,
      paymentStatus,
      amount: stripeAmount,
    });

    const bookingDate = booking.preferredDate
      ? booking.preferredDate.toLocaleDateString("en-US")
      : "your selected date";

    const bookingTime =
      booking.preferredTime || "your selected time";

    await sendSms({
      to: booking.userProfile.phone,
      body: getBookingCreatedSmsBody({
        date: bookingDate,
        time: bookingTime,
      }),
    });

    return NextResponse.json({
      received: true,
      bookingId: booking.id,
      paymentStatus,
    });
  } catch (error) {
    console.error("STRIPE_WEBHOOK_ERROR", error);

    return NextResponse.json(
      {
        success: false,
        message: "Webhook error.",
      },
      { status: 400 }
    );
  }
}