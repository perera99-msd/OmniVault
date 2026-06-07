import mongoose, { Schema, Document, Model } from "mongoose";

export interface ILoan extends Document {
  userId: mongoose.Types.ObjectId;
  personName: string;
  type: "GIVEN" | "RECEIVED";
  amount: number;
  currency: "LKR" | "USD" | "EUR";
  status: "PENDING" | "PARTIAL" | "SETTLED";
  dueDate?: Date;
  associatedWalletId?: mongoose.Types.ObjectId;
  description?: string;
}

const LoanSchema = new Schema<ILoan>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    personName: { type: String, required: true },
    type: { type: String, enum: ["GIVEN", "RECEIVED"], required: true },
    amount: { type: Number, required: true },
    currency: { type: String, enum: ["LKR", "USD", "EUR"], default: "LKR" },
    status: { type: String, enum: ["PENDING", "PARTIAL", "SETTLED"], default: "PENDING" },
    dueDate: { type: Date, required: false },
    associatedWalletId: { type: Schema.Types.ObjectId, ref: "Wallet", required: false },
    description: { type: String, required: false },
  },
  { timestamps: true }
);

if (mongoose.models.Loan) {
  delete mongoose.models.Loan;
}

export const Loan: Model<ILoan> = mongoose.model<ILoan>("Loan", LoanSchema);
