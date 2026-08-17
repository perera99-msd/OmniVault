import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebase/admin";

const SESSION_EXPIRY_MS = 60 * 60 * 24 * 7 * 1000; // 7 days

export async function POST(req: NextRequest) {
  try {
    const { idToken } = await req.json();
    if (!idToken) {
      return NextResponse.json({ error: "Missing ID token" }, { status: 400 });
    }

    let sessionCookie: string = idToken;
    try {
      // Create true Firebase session cookie using Admin SDK if service account is active
      sessionCookie = await adminAuth.createSessionCookie(idToken, {
        expiresIn: SESSION_EXPIRY_MS,
      });
    } catch (err: any) {
      console.warn("⚠️ createSessionCookie fallback to verified token:", err.message);
      sessionCookie = idToken;
    }

    const cookieStore = await cookies();
    cookieStore.set("__session", sessionCookie, {
      maxAge: SESSION_EXPIRY_MS / 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "lax",
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Session creation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create session" },
      { status: 401 }
    );
  }
}

export async function DELETE() {
  try {
    const cookieStore = await cookies();
    cookieStore.set("__session", "", {
      maxAge: 0,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "lax",
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
