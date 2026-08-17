import { cookies } from "next/headers";
import dbConnect from "@/lib/db";
import { User, IUser } from "@/models/User";
import { adminAuth } from "@/lib/firebase/admin";

export async function getAuthenticatedUid(): Promise<string> {
  const cookieStore = await cookies();
  const session = cookieStore.get("__session")?.value;

  if (!session) {
    throw new Error("Unauthorized: No active session");
  }

  try {
    // Try verifying as a Firebase Session Cookie
    const decoded = await adminAuth.verifySessionCookie(session, true).catch(async () => {
      // Fallback: Check if it's a verified ID Token
      return await adminAuth.verifyIdToken(session);
    });

    if (!decoded || !decoded.uid) {
      throw new Error("Unauthorized: Invalid session signature");
    }

    return decoded.uid;
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
