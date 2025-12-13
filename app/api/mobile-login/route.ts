// /api/mobile-login/route.ts
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  try {
    await connectDB();

    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Missing email or password" },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    if (!user.password) {
      return NextResponse.json(
        { success: false, message: "This account does not use password login" },
        { status: 400 }
      );
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: "Invalid password" },
        { status: 401 }
      );
    }

    // Update lastLogin timestamp
    user.lastLogin = new Date();
    await user.save();

    // Mobile JWT
    const secret = process.env.NEXTAUTH_SECRET || "CHANGE_ME";

    const token = jwt.sign(
      { id: String(user._id), email: user.email },
      secret,
      { expiresIn: "7d" }
    );

    return NextResponse.json(
      {
        success: true,
        user: {
          id: String(user._id),
          name: user.name,
          email: user.email,
          provider: user.provider,
          image: user.image,
          lastLogin: user.lastLogin,
        },
        token,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Mobile Login Error:", error);
    return NextResponse.json(
      { success: false, message: "Server error", error },
      { status: 500 }
    );
  }
}