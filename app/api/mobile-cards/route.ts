import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Card from "@/lib/models/Card";
import { encrypt, decrypt } from "@/lib/crypto";
import { z } from "zod";
import jwt from "jsonwebtoken";
import { headers } from "next/headers";
import type { JwtPayload } from "jsonwebtoken";
import { Types } from "mongoose";

// ================= TYPES =================

interface MobileJwtPayload extends JwtPayload {
  email?: string;
  iat?: number;
  exp?: number;
}

interface LeanCard {
  _id: Types.ObjectId;
  cardholderName: string;
  cardNumberEncrypted: string;
  cardNumberLast4: string;
  expiryDate: string;
  cvvEncrypted: string;
  notes?: string;
  createdAt: Date;
}


// Validation schema (NOTE: removed email here — get it from token)
const bodySchema = z.object({
  cardholderName: z.string().min(1, "Cardholder name required"),
  cardNumber: z.string().min(12, "Card number too short"),
  expiryDate: z.string().min(3, "Expiry date required"),
  cvv: z.string().min(3, "CVV required"),
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
    const countOnly = searchParams.get("countOnly");

    // If token provided, use it. Otherwise fallback to query param (backwards compat).
    const email = tokenEmail ?? emailParam;

    if (!email)
      return NextResponse.json({ success: false, message: "Missing email" }, { status: 400 });

    await connectDB();

    // COUNT ONLY SUPPORT (same as website)
    if (countOnly === "true") {
      const count = await Card.countDocuments({ ownerEmail: email });
      return NextResponse.json({ success: true, count }, { status: 200 });
    }

    const cards = await Card.find({ ownerEmail: email })
      .sort({ createdAt: -1 })
      .lean();

    const formatted = cards.map((item: LeanCard) => ({
      _id: item._id.toString(),
      cardholderName: item.cardholderName,
      cardNumber: decrypt(item.cardNumberEncrypted),
      cardNumberLast4: item.cardNumberLast4,
      expiryDate: item.expiryDate,
      cvv: decrypt(item.cvvEncrypted),
      notes: item.notes,
      createdAt: item.createdAt,
    }));

    return NextResponse.json({ success: true, data: formatted });
  } catch (err) {
    console.error("❌ GET mobile-cards:", err);
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
    const { cardholderName, cardNumber, expiryDate, cvv, notes } = parsed.data;

    const created = await Card.create({
      ownerEmail: tokenEmail,
      cardholderName,
      cardNumberEncrypted: encrypt(cardNumber),
      cardNumberLast4: cardNumber.slice(-4),
      expiryDate,
      cvvEncrypted: encrypt(cvv),
      notes,
    });

    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (err) {
    console.error("❌ POST mobile-cards:", err);
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
      return NextResponse.json({ success: false, message: "Missing card ID" }, { status: 400 });

    const parsed = bodySchema.safeParse(rest);
    if (!parsed.success)
      return NextResponse.json({ success: false, issues: parsed.error.flatten() }, { status: 422 });

    await connectDB();
    const { cardholderName, cardNumber, expiryDate, cvv, notes } = parsed.data;

    const updated = await Card.findOneAndUpdate(
      { _id: id, ownerEmail: tokenEmail }, // ensure owner matches token
      {
        $set: {
          cardholderName,
          cardNumberEncrypted: encrypt(cardNumber),
          cardNumberLast4: cardNumber.slice(-4),
          expiryDate,
          cvvEncrypted: encrypt(cvv),
          notes,
        },
      },
      { new: true }
    );

    if (!updated)
      return NextResponse.json({ success: false, message: "Card not found" }, { status: 404 });

    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    console.error("❌ PUT mobile-cards:", err);
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
    const deleted = await Card.deleteOne({ _id: id, ownerEmail: tokenEmail });

    if (!deleted.deletedCount)
      return NextResponse.json({ success: false, message: "Card not found" }, { status: 404 });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("❌ DELETE mobile-cards:", err);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
