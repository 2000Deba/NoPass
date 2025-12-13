import { NextResponse } from "next/server";
import jwt, { JwtPayload } from "jsonwebtoken";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

interface TokenPayload extends JwtPayload {
    id: string;
    email: string;
}

export async function POST(req: Request): Promise<NextResponse> {
    try {
        const authHeader = req.headers.get("authorization") ?? "";
        const token = authHeader.startsWith("Bearer ")
            ? authHeader.substring(7)
            : "";

        if (!token) {
            return NextResponse.json(
                { success: false, message: "Missing token" },
                { status: 401 }
            );
        }

        const secret = process.env.NEXTAUTH_SECRET;
        if (!secret) {
            console.error("🚨 Missing NEXTAUTH_SECRET");
            return NextResponse.json(
                { success: false, message: "Server config error" },
                { status: 500 }
            );
        }

        let payload: TokenPayload;
        try {
            payload = jwt.verify(token, secret) as TokenPayload;
        } catch (error: unknown) {
            const message =
                error instanceof Error && error.name === "TokenExpiredError"
                    ? "Token expired"
                    : "Invalid token";

            return NextResponse.json(
                { success: false, message },
                { status: 401 }
            );
        }

        await connectDB();
        const user = await User.findById(payload.id).select("_id name email provider image");

        if (!user) {
            return NextResponse.json(
                { success: false, message: "User not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Token valid",
            user,
        });
    } catch (err) {
        console.error("mobile-validate error", err);
        return NextResponse.json(
            { success: false, message: "Server error" },
            { status: 500 }
        );
    }
}