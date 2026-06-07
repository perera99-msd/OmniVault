"use client";

import { LogOut } from "lucide-react";
import { auth } from "@/lib/firebase/config";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut(auth);
    router.push("/");
  };

  return (
    <button 
      onClick={handleSignOut}
      className="w-full flex items-center justify-center gap-2 p-5 rounded-2xl border-2 border-dashed border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-900/10 text-rose-600 dark:text-rose-500 font-bold hover:bg-rose-100 dark:hover:bg-rose-900/20 hover:border-rose-300 dark:hover:border-rose-500/50 transition-all mb-4"
    >
      <LogOut className="w-5 h-5" /> Log Out
    </button>
  );
}
