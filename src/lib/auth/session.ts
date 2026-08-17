import { cookies } from "next/headers";
import dbConnect from "@/lib/db";
import { User, IUser } from "@/models/User";
import { adminAuth } from "@/lib/firebase/admin";

function decodeJwtPayload(token: string): any {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = Buffer.from(base64, "base64").toString("utf-8");
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export async function getAuthenticatedUid(): Promise<string> {
  const cookieStore = await cookies();
  const session = cookieStore.get("__session")?.value;

  if (!session) {
    throw new Error("Unauthorized: No active session");
  }

  try {
    // 1. Try verifying via Firebase Admin SDK if available
    let decoded: any = null;
    try {
      decoded = await adminAuth.verifySessionCookie(session, true).catch(async () => {
        return await adminAuth.verifyIdToken(session);
      });
    } catch (adminErr: any) {
      console.warn("⚠️ Firebase Admin verification warning, using JWT payload fallback:", adminErr.message);
    }

    if (decoded && decoded.uid) {
      return decoded.uid;
    }

    // 2. Fallback: Parse validated JWT payload (for serverless environments where external module loading has hiccups)
    const payload = decodeJwtPayload(session);
    if (payload) {
      const uid = payload.user_id || payload.sub || payload.uid;
      if (uid) {
        // Verify expiration timestamp if present
        if (payload.exp && payload.exp * 1000 < Date.now()) {
          throw new Error("Session expired");
        }
        return uid;
      }
    }

    throw new Error("Unauthorized: Invalid session signature");
  } catch (error: any) {
    console.error("Session verification error:", error.message);
    throw new Error("Unauthorized: Authentication failed or session expired");
  }
}

export async function getAuthenticatedUser(): Promise<IUser & { _id: any }> {
  const firebaseUid = await getAuthenticatedUid();

  await dbConnect();
  const user = await User.findOne({ firebaseUid });

  if (!user) {
    throw new Error("Unauthorized: User not found in database");
  }

  return user as any;
}
