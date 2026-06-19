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
        { success: false, message: "Missing Stripe signature." },
        { status: 400 }
      );
    }

    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    if (event.type !== "checkout.session.completed") {
      return NextResponse.json({ received: true });
    }

    const session = event.data.object;

    const metadata = session.metadata;

    if (!metadata) {
      return NextResponse.json(
        { success: false, message: "Missing checkout metadata." },
        { status: 400 }
      );
    }

    const pricing = calculateCleaningPrice({
      cleaningType: metadata.cleaningType as PricingCleaningType,
      homeSize: metadata.homeSize as HomeSize,
      totalSqft: Number(metadata.totalSqft),
    });

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
        bedrooms: metadata.bedrooms ? Number(metadata.bedrooms) : null,
        bathrooms: metadata.bathrooms ? Number(metadata.bathrooms) : null,
        kitchens: metadata.kitchens ? Number(metadata.kitchens) : null,

        preferredDate: metadata.preferredDate
          ? new Date(metadata.preferredDate)
          : null,
        preferredTime: metadata.preferredTime,
        frequency: metadata.frequency as CleaningFrequency,
        specialNotes: metadata.specialNotes,

        status: BookingStatus.PENDING,

        payments: {
          create: {
            amount: pricing.total,
            currency: pricing.currency,
            status: PaymentStatus.PAID,
            provider: "STRIPE",
            checkoutSessionId: session.id,
            paymentIntentId:
              typeof session.payment_intent === "string"
                ? session.payment_intent
                : null,
            paidAt: new Date(),
          },
        },
      },
      include: {
        userProfile: true,
        payments: true,
      },
    });

    const bookingDate = booking.preferredDate
      ? booking.preferredDate.toLocaleDateString("en-US")
      : "your selected date";

    const bookingTime = booking.preferredTime || "your selected time";

    await sendSms({
      to: booking.userProfile.phone,
      body: getBookingCreatedSmsBody({
        date: bookingDate,
        time: bookingTime,
      }),
    });

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("STRIPE_WEBHOOK_ERROR", error);

    return NextResponse.json(
      { success: false, message: "Webhook error." },
      { status: 400 }
    );
  }
}