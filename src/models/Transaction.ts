import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITransaction extends Document {
  userId: mongoose.Types.ObjectId;
  amount: number;
  currency: "LKR" | "USD" | "EUR";
  type: "INCOME" | "EXPENSE" | "TRANSFER";
  categoryId?: mongoose.Types.ObjectId;
  sourceWalletId: mongoose.Types.ObjectId;
  destinationWalletId?: mongoose.Types.ObjectId;
  date: Date;
  description: string;
}

const TransactionSchema = new Schema<ITransaction>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    currency: { type: String, enum: ["LKR", "USD", "EUR"], default: "LKR" },
    type: { type: String, enum: ["INCOME", "EXPENSE", "TRANSFER"], required: true },
    categoryId: { type: Schema.Types.ObjectId, ref: "Category", required: false },
    sourceWalletId: { type: Schema.Types.ObjectId, ref: "Wallet", required: true },
    destinationWalletId: { type: Schema.Types.ObjectId, ref: "Wallet", required: false },
    date: { type: Date, default: Date.now },
    description: { type: String, required: false },
  },
  { timestamps: true }
);

export const Transaction: Model<ITransaction> =
  mongoose.models.Transaction || mongoose.model<ITransaction>("Transaction", TransactionSchema);
