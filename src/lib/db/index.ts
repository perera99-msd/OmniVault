import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (!MONGODB_URI) {
    console.warn("⚠️ MONGODB_URI is undefined. If this is a build step, it is safe to ignore.");
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10, // Prevent Vercel from exhausting MongoDB M0 500 connection limit
      serverSelectionTimeoutMS: 10000, // 10 second timeout
    };

    cached.promise = mongoose.connect(MONGODB_URI as string, opts).then((mongoose) => {
      return mongoose;
    }).catch((err) => {
      cached.promise = null; // CRITICAL: Clear the promise so the next request can retry instead of permanently failing
      
      console.warn(`⚠️ [OmniVault] Failed to connect to Primary MONGODB_URI: ${err.message}`);
      
      // ONLY fallback to localhost if we are actively developing locally. Never in Vercel.
      if (process.env.NODE_ENV !== "production") {
        console.warn("🔄 [OmniVault] Attempting Localhost Fallback...");
        const LOCAL_URI = "mongodb://127.0.0.1:27017/omnivault_dev";
        return mongoose.connect(LOCAL_URI, opts).then((mongoose) => {
          return mongoose;
        }).catch((localErr) => {
          throw localErr;
        });
      }
      
      throw err;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null; // Ensure failed connections are wiped
    throw e;
  }
  
  return cached.conn;
}

export default dbConnect;
