import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { sendSms } from "@/lib/twilio";
import { ProfessionalIdDocumentStatus } from "@prisma/client";

const ADMIN_SESSION_COOKIE = "soho_admin_session";

export async function POST(req: Request) {
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

    if (!body.professionalId) {
      return NextResponse.json(
        { success: false, message: "Professional ID is required." },
        { status: 400 }
      );
    }

    const token = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const professional = await prisma.professionalProfile.update({
      where: {
        id: body.professionalId,
      },
      data: {
        idDocumentStatus: ProfessionalIdDocumentStatus.REUPLOAD_REQUESTED,
        idDocumentReuploadToken: token,
        idDocumentReuploadExpiresAt: expiresAt,
      },
    });

    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const reuploadUrl = `${appUrl}/professional/documents/reupload/${token}`;

    await sendSms({
      to: professional.phone,
      body: `SoHo Cleaning Group: Please reupload your ID document using this secure link: ${reuploadUrl}`,
    });

    return NextResponse.json({
      success: true,
      message: "Document reupload request sent successfully.",
      data: {
        reuploadUrl,
      },
    });
  } catch (error) {
    console.error("REQUEST_DOCUMENT_REUPLOAD_ERROR", error);

    return NextResponse.json(
      { success: false, message: "Something went wrong." },
      { status: 500 }
    );
  }
}