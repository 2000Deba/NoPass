import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/authOptions"
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();
    const user = await User.findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      name: user.name,
      email: user.email,
      provider: user.provider,
      image: user.image,
      lastLogin: user.lastLogin || user.updatedAt || user.createdAt, // fallback
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.error("Error fetching user info:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
