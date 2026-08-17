import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  firebaseUid: string;
  email: string;
  name: string;
  avatar?: string;
  preferences: {
    theme: string;
    currency: string;
    biometricEnabled: boolean;
  };
}

const UserSchema = new Schema<IUser>(
  {
    firebaseUid: { type: String, required: true, unique: true },
    email: { type: String, required: true },
    name: { type: String, required: true },
    avatar: { type: String, default: "sophia" },
    preferences: {
      theme: { type: String, default: "system" },
      currency: { type: String, default: "USD" },
      biometricEnabled: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
