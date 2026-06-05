import mongoose, { Schema, Document, Model } from "mongoose";

export interface IWallet extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  balance: number;
  type: "Cash" | "Bank" | "Digital";
  isActive: boolean;
}

const WalletSchema = new Schema<IWallet>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    balance: { type: Number, default: 0 },
    type: { type: String, enum: ["Cash", "Bank", "Digital"], required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Wallet: Model<IWallet> =
  mongoose.models.Wallet || mongoose.model<IWallet>("Wallet", WalletSchema);
