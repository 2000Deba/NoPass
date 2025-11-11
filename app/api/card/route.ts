import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import Card from "@/lib/models/Card"
import { z } from "zod"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { encrypt, decrypt } from "@/lib/crypto";

// Zod schema validation
const bodySchema = z.object({
  cardholderName: z.string().min(1, "Cardholder name is required."),
  cardNumber: z.string().min(12, "Card number is too short."),
  expiryDate: z.string().min(3, "Expiry date required."),
  cvv: z.string().min(3, "CVV required."),
  notes: z.string().optional(),
})

// POST → Save new card
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const json = await req.json()
    const parsed = bodySchema.safeParse(json)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", issues: parsed.error.flatten() },
        { status: 422 }
      )
    }

    await connectDB()

    const { cardholderName, cardNumber, expiryDate, cvv, notes } = parsed.data;

    // Extract last 4 digits (needed for UI mask)
    const cardNumberLast4 = cardNumber.slice(-4);

    // Encrypt number & cvv but KEEP original formatting (no space remove)
    const cardNumberEncrypted = encrypt(cardNumber);
    const cvvEncrypted = encrypt(cvv);

    const created = await Card.create({
      cardholderName,
      cardNumberEncrypted,
      cardNumberLast4,
      expiryDate,
      cvvEncrypted,
      notes,
      ownerEmail: session.user.email,
    });

    return NextResponse.json({ success: true, data: created }, { status: 201 })
  } catch (err: unknown) {
    console.error("❌ POST /api/card error:", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

// GET → Fetch user’s saved cards OR just count (based on query)
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    // Check if "countOnly=true" query param exists
    const { searchParams } = new URL(req.url)
    const countOnly = searchParams.get("countOnly")
    const emailParam = searchParams.get("email")

    if (countOnly === "true") {
      const targetEmail = emailParam || session.user.email
      const count = await Card.countDocuments({ ownerEmail: targetEmail })
      return NextResponse.json({ count }, { status: 200 })
    }

    // Default → fetch all cards (unchanged)
    const cards = await Card.find({ ownerEmail: session.user.email })
      .sort({ createdAt: -1 })
      .lean()

    // Return decrypted values so UI can decide mask/unmask
    const decryptedCards = cards.map(card => ({
      ...card,
      cardNumber: decrypt(card.cardNumberEncrypted), // full number
      cvv: decrypt(card.cvvEncrypted),          // full cvv
    }));

    return NextResponse.json({ success: true, data: decryptedCards });
  } catch (err: unknown) {
    console.error("❌ GET /api/card error:", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

// DELETE → Delete a specific card
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Missing card ID" }, { status: 400 })
    }

    await connectDB()
    await Card.deleteOne({ _id: id, ownerEmail: session.user.email })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("❌ DELETE /api/card error:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

// PUT → Update existing card
export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const json = await req.json()
    const { id, ...rest } = json

    if (!id) {
      return NextResponse.json({ error: "Missing card ID" }, { status: 400 })
    }

    const parsed = bodySchema.safeParse(rest)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", issues: parsed.error.flatten() },
        { status: 422 }
      )
    }

    const { cardholderName, cardNumber, expiryDate, cvv, notes } = parsed.data;

    const cardNumberLast4 = cardNumber.slice(-4);
    const cardNumberEncrypted = encrypt(cardNumber);
    const cvvEncrypted = encrypt(cvv);

    await connectDB()
    const updated = await Card.findOneAndUpdate(
      { _id: id, ownerEmail: session.user.email },
      { $set: { cardholderName, cardNumberEncrypted, cardNumberLast4, expiryDate, cvvEncrypted, notes } },
      { new: true }
    )

    if (!updated) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: updated })
  } catch (err) {
    console.error("❌ PUT /api/card error:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}