import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  ProfessionalIdDocumentStatus,
  ProfessionalIdDocumentType,
  ProfessionalStatus,
} from "@prisma/client";

import { notifyProfessionalApplicationReceived } from "@/lib/customer-notifications";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const professional = await prisma.professionalProfile.upsert({
      where: {
        email: body.email,
      },
      update: {
        fullName: body.fullName,
        phone: body.phone,
        profileImageUrl: body.profileImageUrl,
        experienceYears: body.experienceYears
          ? Number(body.experienceYears)
          : null,
        servicesOffered: body.servicesOffered || [],
        serviceAreas: body.serviceAreas || [],
        availability: body.availability || [],
        hasOwnSupplies: Boolean(body.hasOwnSupplies),
        hasTransport: Boolean(body.hasTransport),
        bio: body.bio,
        status: ProfessionalStatus.PENDING,

        idDocumentType:
          body.idDocumentType as ProfessionalIdDocumentType,
        idDocumentFrontUrl: body.idDocumentFrontUrl,
        idDocumentBackUrl: body.idDocumentBackUrl,
        idDocumentStatus:
          ProfessionalIdDocumentStatus.PENDING,
        idDocumentReuploadToken: null,
        idDocumentReuploadExpiresAt: null,
      },
      create: {
        fullName: body.fullName,
        email: body.email,
        phone: body.phone,
        profileImageUrl: body.profileImageUrl,
        experienceYears: body.experienceYears
          ? Number(body.experienceYears)
          : null,
        servicesOffered: body.servicesOffered || [],
        serviceAreas: body.serviceAreas || [],
        availability: body.availability || [],
        hasOwnSupplies: Boolean(body.hasOwnSupplies),
        hasTransport: Boolean(body.hasTransport),
        bio: body.bio,
        status: ProfessionalStatus.PENDING,

        idDocumentType:
          body.idDocumentType as ProfessionalIdDocumentType,
        idDocumentFrontUrl: body.idDocumentFrontUrl,
        idDocumentBackUrl: body.idDocumentBackUrl,
        idDocumentStatus:
          ProfessionalIdDocumentStatus.PENDING,
      },
    });

    /*
     * Notification failure must not invalidate a successfully submitted
     * professional application.
     */
    const notificationResult =
      await notifyProfessionalApplicationReceived({
        phone: professional.phone,
        email: professional.email,
        professionalName: professional.fullName,
      });

    if (
      !notificationResult.smsSent ||
      !notificationResult.emailSent
    ) {
      console.warn(
        "PROFESSIONAL_APPLICATION_NOTIFICATION_PARTIAL_FAILURE",
        {
          professionalId: professional.id,
          smsSent: notificationResult.smsSent,
          emailSent: notificationResult.emailSent,
        }
      );
    }

    return NextResponse.json({
      success: true,
      message:
        "Professional onboarding submitted successfully.",
      data: professional,
      notifications: {
        smsSent: notificationResult.smsSent,
        emailSent: notificationResult.emailSent,
      },
    });
  } catch (error) {
    console.error(
      "PROFESSIONAL_ONBOARDING_ERROR",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Something went wrong while submitting professional onboarding.",
      },
      { status: 500 }
    );
  }
}