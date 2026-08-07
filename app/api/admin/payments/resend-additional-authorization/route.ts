import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { AdditionalAuthorizationStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import {
  getAdditionalAuthorizationSmsBody,
  sendSms,
} from "@/lib/twilio";

const ADMIN_SESSION_COOKIE = "soho_admin_session";

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

    const requestId =
      typeof body.requestId === "string"
        ? body.requestId.trim()
        : "";

    if (!requestId) {
      return NextResponse.json(
        {
          success: false,
          message: "Request ID is required.",
        },
        { status: 400 }
      );
    }

    const authorization =
      await prisma.additionalAuthorization.findUnique({
        where: {
          id: requestId,
        },
        include: {
          booking: {
            include: {
              userProfile: true,
              payments: true,
            },
          },
        },
      });

    if (!authorization) {
      return NextResponse.json(
        {
          success: false,
          message: "Authorization request not found.",
        },
        { status: 404 }
      );
    }

    if (
      authorization.status !==
      AdditionalAuthorizationStatus.PENDING
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This authorization request is no longer pending.",
        },
        { status: 400 }
      );
    }

    if (authorization.expiresAt <= new Date()) {
      await prisma.additionalAuthorization.update({
        where: {
          id: authorization.id,
        },
        data: {
          status:
            AdditionalAuthorizationStatus.EXPIRED,
        },
      });

      return NextResponse.json(
        {
          success: false,
          message:
            "This authorization request has expired.",
        },
        { status: 400 }
      );
    }

    const totalAuthorized = Number(
      authorization.booking.payments
        .filter((payment) =>
          ["AUTHORIZED", "PAID"].includes(payment.status)
        )
        .reduce(
          (total, payment) =>
            total + payment.authorizedAmount,
          0
        )
        .toFixed(2)
    );

    const finalAmount = Number(
      (
        totalAuthorized +
        authorization.additionalAmount
      ).toFixed(2)
    );

    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      "http://localhost:3000";

    const authorizationLink = `${appUrl}/authorize-additional/${authorization.token}`;

    const smsSent = await sendSms({
      to: authorization.booking.userProfile.phone,
      body: getAdditionalAuthorizationSmsBody({
        additionalAmount:
          authorization.additionalAmount,
        finalAmount,
        reason:
          authorization.reason || undefined,
        authorizationLink,
      }),
    });

    if (!smsSent) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Unable to resend the authorization SMS.",
        },
        { status: 502 }
      );
    }

    console.log(
      "ADDITIONAL_AUTHORIZATION_RESENT",
      {
        requestId: authorization.id,
        bookingId: authorization.bookingId,
        phone:
          authorization.booking.userProfile.phone,
      }
    );

    return NextResponse.json({
      success: true,
      message:
        "Authorization link has been resent successfully.",
    });
  } catch (error) {
    console.error(
      "RESEND_ADDITIONAL_AUTHORIZATION_ERROR",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Something went wrong while resending the authorization link.",
      },
      { status: 500 }
    );
  }
}