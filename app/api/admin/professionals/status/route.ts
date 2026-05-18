import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ProfessionalStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

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

    if (!body.professionalId || !body.status) {
      return NextResponse.json(
        { success: false, message: "Professional ID and status are required." },
        { status: 400 }
      );
    }

    if (!Object.values(ProfessionalStatus).includes(body.status)) {
      return NextResponse.json(
        { success: false, message: "Invalid professional status." },
        { status: 400 }
      );
    }

    const professional = await prisma.professionalProfile.update({
      where: {
        id: body.professionalId,
      },
      data: {
        status: body.status,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Professional status updated successfully.",
      data: professional,
    });
  } catch (error) {
    console.error("ADMIN_PROFESSIONAL_STATUS_ERROR", error);

    return NextResponse.json(
      { success: false, message: "Something went wrong." },
      { status: 500 }
    );
  }
}