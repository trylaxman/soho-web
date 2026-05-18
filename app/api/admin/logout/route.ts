import { NextResponse } from "next/server";

const ADMIN_SESSION_COOKIE = "soho_admin_session";

export async function POST() {
  const response = NextResponse.redirect(
    new URL("/admin/login", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001")
  );

  response.cookies.set({
    name: ADMIN_SESSION_COOKIE,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return response;
}