export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    if (process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
      console.log("✅ [OmniVault] Firebase Configuration Loaded.");
    }
  }
}
