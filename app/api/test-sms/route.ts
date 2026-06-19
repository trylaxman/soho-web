import { NextResponse } from "next/server";
import { sendSms } from "@/lib/twilio";

export async function GET() {
  try {
    const to = "+918285180202"; // replace with your test phone number

    const smsSent = await sendSms({
      to,
      body: "SoHo Cleaning Group: This is a test SMS notification.",
    });

    return NextResponse.json({
      success: smsSent,
      message: smsSent ? "SMS sent successfully." : "SMS failed. Check server logs.",
    });
  } catch (error) {
    console.error("TEST_SMS_ROUTE_ERROR", error);

    return NextResponse.json(
      {
        success: false,
        message: "SMS test failed.",
      },
      { status: 500 }
    );
  }
}