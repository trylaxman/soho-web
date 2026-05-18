import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ProfessionalStatus } from "@prisma/client";

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
      },
    });

    return NextResponse.json({
      success: true,
      message: "Professional onboarding submitted successfully.",
      data: professional,
    });
  } catch (error) {
    console.error("PROFESSIONAL_ONBOARDING_ERROR", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong while submitting professional onboarding.",
      },
      { status: 500 }
    );
  }
}