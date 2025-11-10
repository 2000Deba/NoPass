import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "";

if (!MONGODB_URI) {
  throw new Error("⚠️ Please define the MONGODB_URI in .env.local");
}

export const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;

  try {
    await mongoose.connect(MONGODB_URI, {
      dbName: "nopass",
    });
    console.log("✅ Connected to MongoDB (nopass)");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    throw error;
  }
};
