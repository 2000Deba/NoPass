// /api/mobile-me/route.ts
import { NextResponse, NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";

interface MobileJwtPayload extends JwtPayload {
  id?: string;
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    // 1) Try NextAuth's getToken (works if NextAuth issued the JWT)
    const tokenFromNextAuth = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    });

    let userId: string | null = null;

    if (tokenFromNextAuth && (tokenFromNextAuth.sub || "id" in tokenFromNextAuth)) {
      userId =
        (tokenFromNextAuth.sub as string) ||
        (tokenFromNextAuth as { id?: string }).id ||
        null;
    } else {
      // 2) Fallback: manual Authorization header JWT (for mobile tokens)
      const authHeader = req.headers.get("authorization") || "";
      if (!authHeader.startsWith("Bearer ")) {
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
      }
      const token = authHeader.split(" ")[1];
      try {
        const decoded = jwt.verify(
          token,
          process.env.NEXTAUTH_SECRET || "CHANGE_ME"
        ) as MobileJwtPayload;

        userId = decoded.id || decoded.sub || null;
      } catch (e) {
        console.error("manual JWT verify failed:", e);
        return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 });
      }
    }

    if (!userId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const user = await User.findById(userId).select("_id name email provider image lastLogin createdAt");

    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        success: true,
        user: {
          id: String(user._id),
          name: user.name,
          email: user.email,
          provider: user.provider,
          image: user.image,
          lastLogin: user.lastLogin ?? null, // return lastLogin
          createdAt: user.createdAt,
        },
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("MOBILE-ME ERROR:", error);

    const message =
      error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      { success: false, message: "Server Error", details: message },
      { status: 500 }
    );
  }
}
