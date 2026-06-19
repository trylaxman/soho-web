import { NextResponse } from "next/server";
import { twilioClient, twilioVerifyServiceSid } from "@/lib/twilio";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.phone) {
      return NextResponse.json(
        { success: false, message: "Phone number is required." },
        { status: 400 }
      );
    }

    await twilioClient.verify.v2
      .services(twilioVerifyServiceSid)
      .verifications.create({
        to: body.phone,
        channel: "sms",
      });

    return NextResponse.json({
      success: true,
      message: "Verification code sent successfully.",
    });
  } catch (error) {
    console.error("SEND_OTP_ERROR", error);

    return NextResponse.json(
      { success: false, message: "Failed to send verification code." },
      { status: 500 }
    );
  }
}