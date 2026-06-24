import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  ProfessionalIdDocumentStatus,
  ProfessionalIdDocumentType,
} from "@prisma/client";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.token) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid reupload token.",
        },
        { status: 400 }
      );
    }

    const professional = await prisma.professionalProfile.findFirst({
      where: {
        idDocumentReuploadToken: body.token,
        idDocumentReuploadExpiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!professional) {
      return NextResponse.json(
        {
          success: false,
          message: "This reupload link is invalid or expired.",
        },
        { status: 404 }
      );
    }

    await prisma.professionalProfile.update({
      where: {
        id: professional.id,
      },
      data: {
        idDocumentType:
          body.idDocumentType as ProfessionalIdDocumentType,

        idDocumentFrontUrl: body.idDocumentFrontUrl,
        idDocumentBackUrl: body.idDocumentBackUrl,

        idDocumentStatus: ProfessionalIdDocumentStatus.PENDING,

        idDocumentReuploadToken: null,
        idDocumentReuploadExpiresAt: null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Documents submitted successfully.",
    });
  } catch (error) {
    console.error("PROFESSIONAL_DOCUMENT_REUPLOAD_ERROR", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong while updating documents.",
      },
      { status: 500 }
    );
  }
}