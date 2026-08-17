import { getApps, getApp, initializeApp, cert, App } from "firebase-admin/app";
import { getAuth, Auth } from "firebase-admin/auth";

function formatPrivateKey(key: string) {
  return key.replace(/\\n/g, "\n");
}

export function initFirebaseAdmin(): App {
  if (getApps().length > 0) {
    return getApp();
  }

  const serviceAccountEnv = process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT;

  if (serviceAccountEnv) {
    try {
      // Support both Base64-encoded JSON and direct JSON string
      const jsonString = serviceAccountEnv.trim().startsWith("{")
        ? serviceAccountEnv
        : Buffer.from(serviceAccountEnv, "base64").toString("utf-8");

      const serviceAccount = JSON.parse(jsonString);

      return initializeApp({
        credential: cert({
          projectId: serviceAccount.project_id,
          clientEmail: serviceAccount.client_email,
          privateKey: formatPrivateKey(serviceAccount.private_key),
        }),
      });
    } catch (err: any) {
      console.error("❌ Failed to parse FIREBASE_ADMIN_SERVICE_ACCOUNT:", err.message);
    }
  }

  // Fallback if client credentials provided or running in GCP environment
  const projectId =
    process.env.FIREBASE_ADMIN_PROJECT_ID ||
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
    "ominivault";

  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

  if (clientEmail && privateKey) {
    return initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey: formatPrivateKey(privateKey),
      }),
    });
  }

  return initializeApp({
    projectId,
  });
}

const adminApp = initFirebaseAdmin();
export const adminAuth: Auth = getAuth(adminApp);
