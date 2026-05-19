import { NextResponse } from "next/server";

const ADMIN_SESSION_COOKIE = "soho_admin_session";

export async function POST(req: Request) {
  const response = NextResponse.redirect(new URL("/admin/login", req.url));

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