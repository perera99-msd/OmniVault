"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/lib/store/useStore";
import { Button } from "@/components/ui/button";

export function BiometricOverlay({ children }: { children: React.ReactNode }) {
  const { biometricEnabled, biometricCredentialId, isAppLocked, setAppLocked } = useAppStore();
  const [unlocking, setUnlocking] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => {
    // If biometrics are enabled, we lock the app on initial load
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
        allowCredentials: [
          {
            id: credentialIdBuffer,
            type: "public-key",
          }
        ]
      };

      const credential = await navigator.credentials.get({
        publicKey: publicKeyCredentialRequestOptions,
      });

      if (credential) {
        setAppLocked(false);
      }
    } catch (err: any) {
      console.error("Biometric unlock failed:", err);
      // Don't alert here to allow seamless fallback if they cancel, they can just click the button again.
    } finally {
      setUnlocking(false);
    }
  };

  if (biometricEnabled && isAppLocked) {
    return (
      <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background/95 backdrop-blur-md">
        <div className="text-center space-y-6 max-w-sm w-full p-4">
          <div className="w-20 h-20 mx-auto rounded-full bg-primary/20 flex items-center justify-center animate-pulse shadow-xl shadow-primary/30">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
              <path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4"/>
              <path d="M14 13.12c0 2.38 0 6.38-1 8.88"/>
              <path d="M17.29 21.02c.12-.6.43-2.3.5-3.02"/>
              <path d="M2 12a10 10 0 0 1 18-6"/>
              <path d="M2 16h.01"/>
              <path d="M21.8 16c.2-2 .131-5.354 0-6"/>
              <path d="M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2"/>
              <path d="M8.65 22c.21-.66.45-1.32.57-2"/>
              <path d="M9 6.8a6 6 0 0 1 9 5.2v2"/>
            </svg>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground">Vault Locked</h2>
          <p className="text-muted-foreground text-lg">Verify your identity to access OmniVault</p>
          <Button size="lg" className="w-full h-14 text-lg font-bold shadow-md shadow-primary/20" onClick={handleUnlock} disabled={unlocking}>
            {unlocking ? "Verifying..." : "Unlock Vault"}
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
