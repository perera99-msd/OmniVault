import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICategory extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  type: "INCOME" | "EXPENSE";
  icon: string;
  color: string;
}

const CategorySchema = new Schema<ICategory>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    type: { type: String, enum: ["INCOME", "EXPENSE"], required: true },
    icon: { type: String, required: true },
    color: { type: String, required: true },
  },
  { timestamps: true }
);

export const Category: Model<ICategory> =
  mongoose.models.Category || mongoose.model<ICategory>("Category", CategorySchema);
