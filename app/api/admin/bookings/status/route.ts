import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { BookingStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getBookingStatusSmsBody, sendSms } from "@/lib/twilio";

const ADMIN_SESSION_COOKIE = "soho_admin_session";

export async function PATCH(req: Request) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get(ADMIN_SESSION_COOKIE);

    if (!session || session.value !== process.env.ADMIN_SESSION_SECRET) {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 }
      );
    }

    const body = await req.json();

    if (!body.bookingId || !body.status) {
      return NextResponse.json(
        { success: false, message: "Booking ID and status are required." },
        { status: 400 }
      );
    }

    if (!Object.values(BookingStatus).includes(body.status)) {
      return NextResponse.json(
        { success: false, message: "Invalid booking status." },
        { status: 400 }
      );
    }

    const booking = await prisma.booking.update({
      where: {
        id: body.bookingId,
      },
      data: {
        status: body.status,
      },
      include: {
        userProfile: true,
      },
    });

    await sendSms({
      to: booking.userProfile.phone,
      body: getBookingStatusSmsBody(body.status),
    });

    return NextResponse.json({
      success: true,
      message: "Booking status updated successfully.",
      data: booking,
    });
  } catch (error) {
    console.error("ADMIN_BOOKING_STATUS_ERROR", error);

    return NextResponse.json(
      { success: false, message: "Something went wrong." },
      { status: 500 }
    );
  }
}