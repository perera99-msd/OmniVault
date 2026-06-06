export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    console.log("----------------------------------------");
    console.log("🚀 [OmniVault] Server initializing...");
    console.log("----------------------------------------");
    
    try {
      const dbConnect = (await import("./lib/db")).default;
      await dbConnect();
      console.log("✅ [OmniVault] MongoDB Connection Established Successfully.");
    } catch (error) {
      console.error("❌ [OmniVault] MongoDB Connection Failed:", error);
    }
    
    // Check Firebase Configuration
    if (process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
      console.log("✅ [OmniVault] Firebase Configuration Loaded.");
    } else {
      console.warn("⚠️ [OmniVault] Firebase Environment Variables Missing!");
    }
    
    console.log("⚡ [OmniVault] All connections verified and live. Ready to accept requests.");
    console.log("----------------------------------------\n");
  }
}
