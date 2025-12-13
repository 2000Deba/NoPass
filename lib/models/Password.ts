import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPassword extends Document {
  website: string;
  username: string;
  password: string;
  notes?: string;
  ownerEmail: string;
  createdAt: Date;
  updatedAt: Date;
}

const PasswordSchema = new Schema<IPassword>(
  {
    website: { type: String, required: true },
    username: { type: String, required: true },
    password: { type: String, required: true },
    notes: { type: String },
    ownerEmail: { type: String, required: true }
  },
  { timestamps: true }
);

// Prevent model overwrite errors during hot reload
export const Password: Model<IPassword> =
  mongoose.models.Password || mongoose.model<IPassword>("Password", PasswordSchema);

export default Password;