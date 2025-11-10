import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  name?: string;
  email: string;
  password?: string;
  provider?: string;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
  resetPasswordToken: string | undefined;
  resetPasswordExpires: Date | undefined;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String },
    provider: { type: String, default: "credentials" },
    image: { type: String },
    lastLogin: { type: Date, default: null },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
  },
  { timestamps: true }
);

UserSchema.index(
  { resetPasswordExpires: 1 },
  { expireAfterSeconds: 0 }
);

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
