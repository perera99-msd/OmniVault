"use server";

import dbConnect from "@/lib/db";
import { User } from "@/models/User";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

/**
 * Validates the user session from the cookie.
 */
async function getAuthenticatedUser() {
  const cookieStore = await cookies();
  const firebaseUid = cookieStore.get("firebaseUid")?.value;

  if (!firebaseUid) {
    throw new Error("Unauthorized: No session found");
  }

  await dbConnect();
  const user = await User.findOne({ firebaseUid });
  
  if (!user) {
    throw new Error("Unauthorized: User not found in database");
  }

  return user;
}

export async function updateUserName(newName: string) {
  try {
    if (!newName || newName.trim().length === 0) {
      return { success: false, error: "Name cannot be empty." };
    }

    const user = await getAuthenticatedUser();
    user.name = newName.trim();
    await user.save();

    revalidatePath("/settings");
    revalidatePath("/");
    
    return { success: true };
  } catch (error: any) {
    console.error("Error updating user name:", error);
    return { success: false, error: error.message || "Failed to update name." };
  }
}
