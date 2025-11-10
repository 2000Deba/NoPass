import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICard extends Document {
  cardholderName: string;
  cardNumberEncrypted: string;
  cardNumberLast4: string;
  expiryDate: string;
  cvvEncrypted: string;
  notes?: string;
  ownerEmail: { type: string, required: true };
  createdAt: Date;
  updatedAt: Date;
}

const CardSchema = new Schema<ICard>(
  {
    cardholderName: { type: String, required: true },
    cardNumberEncrypted: { type: String, required: true },
    cardNumberLast4: { type: String, required: true },
    expiryDate: { type: String, required: true },
    cvvEncrypted: { type: String, required: true },
    notes: { type: String },
    ownerEmail: { type: String, required: true },
  },
  { timestamps: true }
);

// Prevent model overwrite errors during hot reload
export const Card: Model<ICard> =
  mongoose.models.Card || mongoose.model<ICard>("Card", CardSchema);

export default Card;
