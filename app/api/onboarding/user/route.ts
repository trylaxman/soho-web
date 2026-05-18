import { NextResponse } from "next/server";
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

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const calculatedPricing = calculateCleaningPrice({
      cleaningType: body.cleaningType as PricingCleaningType,
      homeSize: body.homeSize as HomeSize,
      totalSqft: Number(body.totalSqft),
    });

    const user = await prisma.userProfile.upsert({
      where: {
        email: body.email,
      },
      update: {
        fullName: body.fullName,
        phone: body.phone,
        address: body.address,
        apartment: body.apartment,
        city: body.city,
        state: body.state,
        zipCode: body.zipCode,
      },
      create: {
        fullName: body.fullName,
        email: body.email,
        phone: body.phone,
        address: body.address,
        apartment: body.apartment,
        city: body.city,
        state: body.state,
        zipCode: body.zipCode,
      },
    });

    const booking = await prisma.booking.create({
      data: {
        userProfileId: user.id,

        cleaningType: body.cleaningType as CleaningType,
        homeSize: body.homeSize,
        bedrooms: body.bedrooms ? Number(body.bedrooms) : null,
        bathrooms: body.bathrooms ? Number(body.bathrooms) : null,
        kitchens: body.kitchens ? Number(body.kitchens) : null,

        preferredDate: body.preferredDate
          ? new Date(body.preferredDate)
          : null,
        preferredTime: body.preferredTime,
        frequency: body.frequency as CleaningFrequency,
        specialNotes: body.specialNotes,

        status: BookingStatus.PENDING,

        payments: {
          create: {
            amount: calculatedPricing.total,
            currency: calculatedPricing.currency,
            status: PaymentStatus.PENDING,
            provider: "STRIPE",
          },
        },
      },
      include: {
        userProfile: true,
        payments: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Booking request created successfully.",
      data: {
        user,
        booking,
        pricing: calculatedPricing,
      },
    });
  } catch (error) {
    console.error("USER_BOOKING_ERROR", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong while creating booking.",
      },
      { status: 500 }
    );
  }
}