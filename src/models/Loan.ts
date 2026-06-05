import mongoose, { Schema, Document, Model } from "mongoose";

export interface ILoan extends Document {
  userId: mongoose.Types.ObjectId;
  personName: string;
  type: "GIVEN" | "RECEIVED";
  amount: number;
  status: "PENDING" | "PARTIAL" | "SETTLED";
  dueDate?: Date;
  associatedWalletId: mongoose.Types.ObjectId;
}

const LoanSchema = new Schema<ILoan>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    personName: { type: String, required: true },
    type: { type: String, enum: ["GIVEN", "RECEIVED"], required: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: ["PENDING", "PARTIAL", "SETTLED"], default: "PENDING" },
    dueDate: { type: Date, required: false },
    associatedWalletId: { type: Schema.Types.ObjectId, ref: "Wallet", required: true },
  },
  { timestamps: true }
);

export const Loan: Model<ILoan> =
  mongoose.models.Loan || mongoose.model<ILoan>("Loan", LoanSchema);
