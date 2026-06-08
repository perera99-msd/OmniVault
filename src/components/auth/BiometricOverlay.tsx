"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Fingerprint } from "lucide-react";
import { useAppStore } from "@/lib/store/useStore";

export function BiometricOverlay({ children }: { children: React.ReactNode }) {
  const { biometricEnabled, biometricCredentialId, isAppLocked, setAppLocked } = useAppStore();
  const [unlocking, setUnlocking] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => {
    if (biometricEnabled && !hasInitialized) {
      setAppLocked(true);
      setHasInitialized(true);
    }
  }, [biometricEnabled, hasInitialized, setAppLocked]);

  const decodeBuffer = (base64Url: string) => {
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  };

  const handleUnlock = async () => {
    setUnlocking(true);
    try {
      if (!biometricCredentialId) {
        throw new Error("No biometric credential saved.");
      }

      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);
      const credentialIdBuffer = decodeBuffer(biometricCredentialId);

      const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions = {
        challenge: challenge,
        timeout: 60000,
        userVerification: "required",
        allowCredentials: [{ id: credentialIdBuffer, type: "public-key" }]
      };

      const credential = await navigator.credentials.get({
        publicKey: publicKeyCredentialRequestOptions,
      });

      if (credential) {
        setAppLocked(false);
      }
    } catch (err: any) {
      console.error("Biometric unlock failed:", err);
    } finally {
      setUnlocking(false);
    }
  };

  if (biometricEnabled && isAppLocked) {
    return (
      <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white/60 dark:bg-black/60 backdrop-blur-[60px]">
        {/* Glow behind the scanner */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-emerald-500/20 dark:bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none" />

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="text-center space-y-8 max-w-sm w-full p-8 relative z-10"
        >
          {/* Fingerprint Scanner Container */}
          <div className="relative w-32 h-32 mx-auto flex items-center justify-center">
            {/* Base Icon */}
            <Fingerprint className="w-24 h-24 text-zinc-300 dark:text-zinc-800" strokeWidth={1} />
            
            {/* Glowing Active Icon */}
            <motion.div
              animate={unlocking ? { opacity: [0.5, 1, 0.5] } : { opacity: 0 }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <Fingerprint className="w-24 h-24 text-emerald-500 drop-shadow-[0_0_15px_rgba(16,185,129,0.8)]" strokeWidth={1.5} />
            </motion.div>

            {/* Laser Scan Line */}
            {unlocking && (
              <motion.div
                initial={{ top: "10%" }}
                animate={{ top: "90%" }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "linear", repeatType: "reverse" }}
                className="absolute left-[10%] right-[10%] h-[2px] bg-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,1)] z-20"
              />
            )}
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white">Vault Locked</h2>
            <p className="text-zinc-500 dark:text-zinc-400 font-medium text-[15px]">
              Verify your identity to access OmniVault
            </p>
          </div>

          <button 
            className="w-full h-14 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-[15px] font-bold rounded-2xl shadow-lg shadow-zinc-900/20 dark:shadow-white/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2" 
            onClick={handleUnlock} 
            disabled={unlocking}
          >
            {unlocking ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 dark:border-zinc-900/30 border-t-white dark:border-t-zinc-900 rounded-full animate-spin" />
                Scanning...
              </>
            ) : "Unlock Vault"}
          </button>
        </motion.div>
      </div>
    );
  }

  return <>{children}</>;
}
