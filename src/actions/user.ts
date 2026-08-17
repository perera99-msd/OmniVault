"use server";

import dbConnect from "@/lib/db";
import { User } from "@/models/User";
import { revalidatePath } from "next/cache";
import { getAuthenticatedUser } from "@/lib/auth/session";

export async function updateUserName(newName: string) {
  try {
    if (!newName || newName.trim().length === 0) {
      return { success: false, error: "Name cannot be empty." };
    }

    await dbConnect();
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

export async function updateUserAvatar(avatarId: string) {
  try {
    if (!avatarId) {
      return { success: false, error: "Avatar ID is required." };
    }

    await dbConnect();
    const user = await getAuthenticatedUser();
    user.avatar = avatarId;
    await user.save();

    revalidatePath("/settings");
    revalidatePath("/");
    
    return { success: true };
  } catch (error: any) {
    console.error("Error updating user avatar:", error);
    return { success: false, error: error.message || "Failed to update avatar." };
  }
}
