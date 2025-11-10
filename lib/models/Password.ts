import mongoose, { Schema, models } from "mongoose";

const PasswordSchema = new Schema(
  {
    website: { type: String, required: true },
    username: { type: String, required: true },
    password: { type: String, required: true },
    notes: { type: String },
    ownerEmail: { type: String, required: true }
  },
  { timestamps: true }
);

export const Password =
  models.Password || mongoose.model("Password", PasswordSchema);
