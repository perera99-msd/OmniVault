"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Fingerprint } from "lucide-react";
import { useAppStore } from "@/lib/store/useStore";
import { TriaLogo } from "@/components/ui/TriaLogo";

export function BiometricOverlay({ children }: { children: React.ReactNode }) {
  const { biometricEnabled, biometricCredentialId, isAppLocked, setAppLocked } = useAppStore();
  const [unlocking, setUnlocking] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => {
    setMounted(true);
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

  if (mounted && biometricEnabled && isAppLocked) {
    return (
      <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#FDFBF7]/80 dark:bg-[#121412]/85 backdrop-blur-[60px]">
        {/* Glow behind the scanner */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#987B5E]/20 dark:bg-[#987B5E]/15 rounded-full blur-[90px] pointer-events-none" />

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="text-center space-y-8 max-w-sm w-full p-8 relative z-10"
        >
          {/* Tria Trinity Logo */}
          <div className="flex justify-center mb-2">
            <TriaLogo size={48} />
          </div>

          {/* Fingerprint Scanner Container */}
          <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
            {/* Base Icon */}
            <Fingerprint className="w-20 h-20 text-[#6C5B4C]/40 dark:text-[#EBE8E3]/20" strokeWidth={1} />
            
            {/* Glowing Active Icon */}
            <motion.div
              animate={unlocking ? { opacity: [0.5, 1, 0.5] } : { opacity: 0 }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <Fingerprint className="w-20 h-20 text-[#987B5E] drop-shadow-[0_0_15px_rgba(152,123,94,0.8)]" strokeWidth={1.5} />
            </motion.div>

            {/* Laser Scan Line */}
            {unlocking && (
              <motion.div
                initial={{ top: "10%" }}
                animate={{ top: "90%" }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "linear", repeatType: "reverse" }}
                className="absolute left-[10%] right-[10%] h-[2px] bg-[#987B5E] drop-shadow-[0_0_8px_rgba(152,123,94,1)] z-20"
              />
            )}
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl font-black tracking-tight text-[#1A1D1A] dark:text-[#EBE8E3] font-heading">Vault Locked</h2>
            <p className="text-[#6C5B4C] dark:text-[#9A9EA4] font-medium text-[15px]">
              Verify your biometric identity to access Tria
            </p>
          </div>

          <button 
            className="w-full h-14 btn-tria-primary rounded-2xl text-[15px] font-bold shadow-lg disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2" 
            onClick={handleUnlock} 
            disabled={unlocking}
          >
            {unlocking ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
