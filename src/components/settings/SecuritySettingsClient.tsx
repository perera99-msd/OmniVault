"use client";

import { useState, useEffect } from "react";
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
      // Turn off
      setBiometricEnabled(false);
      setBiometricCredentialId(null);
      return;
    }

    // Turn on: Ask OS to create a new local platform credential
    try {
      if (!window.PublicKeyCredential) {
        alert("WebAuthn is not supported on this browser.");
        return;
      }
      
      const isAvailable = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      if (!isAvailable) {
        alert("No biometric or platform authenticator found on this device.");
        return;
      }

      // Generate a random user ID and challenge
      const userId = new Uint8Array(16);
      crypto.getRandomValues(userId);
      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);

      const credential = await navigator.credentials.create({
        publicKey: {
          challenge: challenge,
          rp: {
            name: "OmniVault",
          },
          user: {
            id: userId,
            name: user.email,
            displayName: user.email,
          },
          pubKeyCredParams: [
            { type: "public-key", alg: -7 }, // ES256
            { type: "public-key", alg: -257 } // RS256
          ],
          authenticatorSelection: {
            authenticatorAttachment: "platform",
            userVerification: "required",
          },
          timeout: 60000,
        }
      });

      if (credential) {
        // Success! Save the credential ID locally
        const credId = encodeBuffer((credential as any).rawId);
        setBiometricCredentialId(credId);
        setBiometricEnabled(true);
        alert("Biometrics successfully enabled for OmniVault!");
      }
    } catch (err: any) {
      console.error("Biometric setup failed:", err);
      alert("Failed to setup biometrics. " + err.message);
    }
  };

  return (
    <div className="bg-white dark:bg-[#121214] border border-zinc-200 dark:border-white/5 p-8 sm:p-10 rounded-[2.5rem] shadow-sm relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-64 h-64 blur-[80px] rounded-full pointer-events-none opacity-0 bg-orange-500 transition-opacity duration-700 group-hover:opacity-10" />

      <h3 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white mb-8 flex items-center gap-3">
        <div className="p-2.5 bg-orange-50 dark:bg-orange-500/10 rounded-xl">
          <Shield className="w-5 h-5 text-orange-500" />
        </div>
        Account Security
      </h3>
      
      <div className="space-y-4">
        <div 
          onClick={handleBiometricToggle}
          className="flex items-center justify-between p-5 sm:p-6 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800 transition-colors hover:border-orange-500/30 cursor-pointer"
        >
          <div className="flex items-center gap-4">
            <div className="p-2 bg-white dark:bg-zinc-800 rounded-lg shadow-sm">
              <Fingerprint className="w-5 h-5 text-zinc-400 dark:text-zinc-500" />
            </div>
            <div>
              <h4 className="font-bold text-zinc-900 dark:text-white">Biometric Authentication</h4>
              <p className="text-xs text-zinc-500 font-medium mt-1">Require Face ID / Touch ID when opening the app.</p>
            </div>
          </div>
          <div className={`w-12 h-6 rounded-full p-1 shadow-inner transition-colors ${biometricEnabled ? 'bg-emerald-500' : 'bg-zinc-200 dark:bg-zinc-700'}`}>
            <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${biometricEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 sm:p-6 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800 transition-colors hover:border-orange-500/30 gap-4">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-white dark:bg-zinc-800 rounded-lg shadow-sm">
              <Lock className="w-5 h-5 text-zinc-400 dark:text-zinc-500" />
            </div>
            <div>
              <h4 className="font-bold text-zinc-900 dark:text-white">Change Password</h4>
              <p className="text-xs text-zinc-500 font-medium mt-1">
                {passwordMessage ? (
                  <span className="text-emerald-500">{passwordMessage}</span>
                ) : (
                  "Managed securely via Firebase Auth."
                )}
              </p>
            </div>
          </div>
          <button 
            onClick={handlePasswordReset} 
            disabled={resettingPassword}
            className="text-xs font-bold bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:scale-105 px-5 py-2.5 rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
          >
            {resettingPassword ? "Sending..." : "Reset"}
          </button>
        </div>
      </div>
    </div>
  );
}
