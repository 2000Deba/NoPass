import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Password } from "@/lib/models/Password";
import { encrypt, decrypt } from "@/lib/crypto";
import { z } from "zod";
import jwt from "jsonwebtoken";
import { headers } from "next/headers";
import type { JwtPayload } from "jsonwebtoken";
import { Types } from "mongoose";

interface MobileJwtPayload extends JwtPayload {
  email?: string;
}

interface LeanPassword {
  _id: Types.ObjectId;
  website: string;
  username: string;
  password: string; // encrypted
  notes?: string;
  createdAt: Date;
}

// Validation schema
const bodySchema = z.object({
  website: z.string().min(6, "Website required"),
  username: z.string().min(4, "Username required"),
  password: z.string().min(6, "Password required"),
  notes: z.string().optional(),
});

// Helper to extract verified email from bearer token
async function getEmailFromToken(): Promise<string | null> {
  try {
    const headerList = await headers();
    const authHeader = headerList.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer "))
      return null;

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET!) as MobileJwtPayload;

    if (!decoded || !decoded.email) return null;

    return decoded.email;
  } catch (err) {
    console.error("JWT verification failed:", err);
    return null;
  }
}

/* ---------------- GET ---------------- */
export async function GET(req: Request) {
  try {
    // Try to get email from token first (preferred secure flow)
    const tokenEmail = await getEmailFromToken();

    const { searchParams } = new URL(req.url);
    const emailParam = searchParams.get("email");
    const countOnly = searchParams.get("countOnly") === "true";

    // If token provided, use it. Otherwise fallback to query param (backwards compat).
    const email = tokenEmail ?? emailParam;

    if (!email)
      return NextResponse.json({ success: false, message: "Missing email" }, { status: 400 });

    await connectDB();

    if (countOnly) {
      // Return count only
      const count = await Password.countDocuments({ ownerEmail: email });
      return NextResponse.json({ success: true, count });
    }

    const passwords = await Password.find({ ownerEmail: email })
      .sort({ createdAt: -1 })
      .lean();

    const formatted = passwords.map((item: LeanPassword) => ({
      _id: item._id.toString(),
      website: item.website,
      username: item.username,
      password: decrypt(item.password),
      notes: item.notes,
      createdAt: item.createdAt,
    }));

    return NextResponse.json({ success: true, data: formatted });
  } catch (err) {
    console.error("❌ GET mobile-passwords:", err);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

/* ---------------- POST ---------------- */
export async function POST(req: Request) {
  try {
    // Verify token (required for create)
    const tokenEmail = await getEmailFromToken();
    if (!tokenEmail) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const json = await req.json();
    const parsed = bodySchema.safeParse(json);

    if (!parsed.success)
      return NextResponse.json({ success: false, issues: parsed.error.flatten() }, { status: 422 });

    await connectDB();
    const { website, username, password, notes } = parsed.data;

    const created = await Password.create({
      ownerEmail: tokenEmail,
      website,
      username,
      password: encrypt(password),
      notes,
    });

    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (err) {
    console.error("❌ POST mobile-passwords:", err);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

/* ---------------- PUT ---------------- */
export async function PUT(req: Request) {
  try {
    // Verify token (required for update)
    const tokenEmail = await getEmailFromToken();
    if (!tokenEmail) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const json = await req.json();
    const { id, ...rest } = json;

    if (!id)
      return NextResponse.json({ success: false, message: "Missing password ID" }, { status: 400 });

    const parsed = bodySchema.safeParse(rest);
    if (!parsed.success)
      return NextResponse.json({ success: false, issues: parsed.error.flatten() }, { status: 422 });

    await connectDB();
    const { website, username, password, notes } = parsed.data;

    const updated = await Password.findOneAndUpdate(
      { _id: id, ownerEmail: tokenEmail }, // ensure owner matches token
      {
        $set: {
          website,
          username,
          password: encrypt(password),
          notes,
        },
      },
      { new: true }
    );

    if (!updated)
      return NextResponse.json({ success: false, message: "Password not found" }, { status: 404 });

    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    console.error("❌ PUT mobile-passwords:", err);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

/* ---------------- DELETE ---------------- */
export async function DELETE(req: Request) {
  try {
    // Verify token (required for delete)
    const tokenEmail = await getEmailFromToken();
    if (!tokenEmail) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id)
      return NextResponse.json({ success: false, message: "Missing params" }, { status: 400 });

    await connectDB();
    const deleted = await Password.deleteOne({ _id: id, ownerEmail: tokenEmail });

    if (!deleted.deletedCount)
      return NextResponse.json({ success: false, message: "Password not found" }, { status: 404 });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("❌ DELETE mobile-passwords:", err);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}