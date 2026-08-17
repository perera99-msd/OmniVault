"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Shield, Fingerprint, Lock } from "lucide-react";
import { auth } from "@/lib/firebase/config";
import { sendPasswordResetEmail } from "firebase/auth";
import { useAppStore } from "@/lib/store/useStore";

interface SecurityProps {
  user: {
    email: string;
  };
}

export function SecuritySettingsClient({ user }: SecurityProps) {
  const { biometricEnabled, setBiometricEnabled, setBiometricCredentialId } = useAppStore();
  const [resettingPassword, setResettingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);

  const handlePasswordReset = async () => {
    setResettingPassword(true);
    setPasswordMessage(null);
    try {
      await sendPasswordResetEmail(auth, user.email);
      setPasswordMessage("Password reset email sent! Please check your inbox.");
    } catch (err: any) {
      console.error(err);
      setPasswordMessage(err.message || "Failed to send reset email.");
    } finally {
      setResettingPassword(false);
    }
  };

  const encodeBuffer = (buffer: ArrayBuffer) => {
    return btoa(String.fromCharCode(...new Uint8Array(buffer)))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  };

  const handleBiometricToggle = async () => {
    if (biometricEnabled) {
      setBiometricEnabled(false);
      setBiometricCredentialId(null);
      toast.info("Biometric lock disabled.");
      return;
    }

    try {
      if (!window.PublicKeyCredential) {
        toast.error("WebAuthn is not supported on this browser.");
        return;
      }
      
      const isAvailable = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      if (!isAvailable) {
        toast.error("No biometric or platform authenticator found on this device.");
        return;
      }

      const userId = new Uint8Array(16);
      crypto.getRandomValues(userId);
      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);

      const credential = await navigator.credentials.create({
        publicKey: {
          challenge: challenge,
          rp: {
            name: "Tria Finance",
          },
          user: {
            id: userId,
            name: user.email,
            displayName: user.email,
          },
          pubKeyCredParams: [
            { type: "public-key", alg: -7 },
            { type: "public-key", alg: -257 }
          ],
          authenticatorSelection: {
            authenticatorAttachment: "platform",
            userVerification: "required",
          },
          timeout: 60000,
        }
      });

      if (credential) {
        const credId = encodeBuffer((credential as any).rawId);
        setBiometricCredentialId(credId);
        setBiometricEnabled(true);
        toast.success("Biometrics successfully enabled for Tria!");
      }
    } catch (err: any) {
      console.error("Biometric setup failed:", err);
      toast.error("Failed to setup biometrics: " + (err.message || "Operation cancelled"));
    }
  };

  return (
    <div className="bg-white dark:bg-[#181B18] border border-[#E8E2D8] dark:border-white/5 p-8 sm:p-10 rounded-[2.5rem] shadow-sm relative overflow-hidden group">
      <h3 className="text-2xl font-black tracking-tight text-[#1A1D1A] dark:text-[#EBE8E3] mb-8 flex items-center gap-3 font-heading">
        <div className="p-2.5 bg-[#987B5E]/10 rounded-xl text-[#987B5E]">
          <Shield className="w-5 h-5" />
        </div>
        Vault Security
      </h3>
      
      <div className="space-y-4">
        <div 
          onClick={handleBiometricToggle}
          className="flex items-center justify-between p-5 sm:p-6 bg-[#FAF8F3] dark:bg-[#202420] rounded-2xl border border-[#E8E2D8] dark:border-white/10 transition-colors hover:border-[#987B5E]/50 cursor-pointer"
        >
          <div className="flex items-center gap-4">
            <div className="p-2 bg-white dark:bg-[#181B18] rounded-lg shadow-sm text-[#987B5E]">
              <Fingerprint className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-[#1A1D1A] dark:text-[#EBE8E3]">Biometric Authentication</h4>
              <p className="text-xs text-[#6C5B4C] dark:text-[#9A9EA4] font-medium mt-1">Require Face ID / Touch ID when unlocking Tria.</p>
            </div>
          </div>
          <div className={`w-12 h-6 rounded-full p-1 shadow-inner transition-colors ${biometricEnabled ? 'bg-[#213F33] dark:bg-[#4E6C5F]' : 'bg-[#E8E2D8] dark:bg-[#2C2F33]'}`}>
            <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${biometricEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 sm:p-6 bg-[#FAF8F3] dark:bg-[#202420] rounded-2xl border border-[#E8E2D8] dark:border-white/10 transition-colors hover:border-[#987B5E]/50 gap-4">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-white dark:bg-[#181B18] rounded-lg shadow-sm text-[#987B5E]">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-[#1A1D1A] dark:text-[#EBE8E3]">Change Vault Password</h4>
              <p className="text-xs text-[#6C5B4C] dark:text-[#9A9EA4] font-medium mt-1">
                {passwordMessage ? (
                  <span className="text-[#213F33] dark:text-[#4E6C5F] font-bold">{passwordMessage}</span>
                ) : (
                  "Managed securely via Firebase Authentication."
                )}
              </p>
            </div>
          </div>
          <button 
            onClick={handlePasswordReset} 
            disabled={resettingPassword}
            className="text-xs font-bold btn-tria-primary px-5 py-2.5 rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50"
          >
            {resettingPassword ? "Sending..." : "Reset"}
          </button>
        </div>
      </div>
    </div>
  );
}
