import { NextResponse } from "next/server";
import { twilioClient, twilioVerifyServiceSid } from "@/lib/twilio";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.phone || !body.code) {
      return NextResponse.json(
        { success: false, message: "Phone and code are required." },
        { status: 400 }
      );
    }

    const verification = await twilioClient.verify.v2
      .services(twilioVerifyServiceSid)
      .verificationChecks.create({
        to: body.phone,
        code: body.code,
      });

    if (verification.status !== "approved") {
      return NextResponse.json(
        { success: false, message: "Invalid verification code." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Phone verified successfully.",
    });
  } catch (error) {
    console.error("VERIFY_OTP_ERROR", error);

    return NextResponse.json(
      { success: false, message: "Failed to verify phone." },
      { status: 500 }
    );
  }
}