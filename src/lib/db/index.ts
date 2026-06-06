import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable inside .env.local");
}

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI as string, opts).then((mongoose) => {
      return mongoose;
    }).catch((err) => {
      console.warn(`⚠️ [OmniVault] Failed to connect to Primary MONGODB_URI: ${err.message}`);
      console.warn("🔄 [OmniVault] Attempting Localhost Fallback...");
      
      const LOCAL_URI = "mongodb://127.0.0.1:27017/omnivault_dev";
      return mongoose.connect(LOCAL_URI, opts).then((mongoose) => {
        return mongoose;
      }).catch((localErr) => {
        throw localErr;
      });
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

export default dbConnect;
