import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";

const COOKIE = process.env.SESSION_COOKIE_NAME ?? "__session";

export async function GET(req: Request) {
  try {
    const cookie = req.headers
      .get("cookie")
      ?.split("; ")
      .find((c) => c.startsWith(COOKIE + "="))
      ?.split("=")[1];

    if (!cookie) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    const decoded = await adminAuth.verifySessionCookie(
      cookie,
      true
    );

    return NextResponse.json({
      user: {
        name: decoded.name || "",
        email: decoded.email,
      },
    });
  } catch (error) {
    return NextResponse.json({ user: null }, { status: 401 });
  }
}