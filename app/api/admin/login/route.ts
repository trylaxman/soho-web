import { NextResponse } from "next/server";

const ADMIN_SESSION_COOKIE = "soho_admin_session";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const sessionSecret = process.env.ADMIN_SESSION_SECRET;

    if (!adminEmail || !adminPassword || !sessionSecret) {
      return NextResponse.json(
        {
          success: false,
          message: "Admin environment variables are missing.",
        },
        { status: 500 }
      );
    }

    if (body.email !== adminEmail || body.password !== adminPassword) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email or password.",
        },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      success: true,
      message: "Admin logged in successfully.",
    });

    response.cookies.set({
      name: ADMIN_SESSION_COOKIE,
      value: sessionSecret,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    return response;
  } catch (error) {
    console.error("ADMIN_LOGIN_ERROR", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong while logging in.",
      },
      { status: 500 }
    );
  }
}