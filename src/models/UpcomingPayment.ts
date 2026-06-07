import mongoose, { Schema, Document } from "mongoose";

export interface IUpcomingPayment extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  amount: number;
  currency: "LKR" | "USD" | "EUR";
  dueDate: Date;
  walletId?: mongoose.Types.ObjectId;
  isPaid: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UpcomingPaymentSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, enum: ["LKR", "USD", "EUR"], default: "LKR" },
    dueDate: { type: Date, required: true },
    walletId: { type: Schema.Types.ObjectId, ref: "Wallet" },
    isPaid: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const UpcomingPayment = mongoose.models.UpcomingPayment || mongoose.model<IUpcomingPayment>("UpcomingPayment", UpcomingPaymentSchema);
