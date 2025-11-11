import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { Password } from "@/lib/models/Password"
import { z } from "zod"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { encrypt, decrypt } from "@/lib/crypto";

// Validation schema
const bodySchema = z.object({
  website: z.string().min(1, "Website name required"),
  username: z.string().min(1, "Username required"),
  password: z.string().min(1, "Password required"),
  notes: z.string().optional(),
})

// POST → Save new password entry
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

    const created = await Password.create({
      website: parsed.data.website,
      username: parsed.data.username,
      password: encrypt(parsed.data.password),
      notes: parsed.data.notes,
      ownerEmail: session.user.email,
    })

    return NextResponse.json({ success: true, data: created }, { status: 201 })
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Server error";

    console.error("❌ API /api/password error:", message);
    return NextResponse.json({ error: "Server error", message }, { status: 500 });
  }
}

// GET → Fetch user’s passwords OR just count (based on query)
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
      const count = await Password.countDocuments({ ownerEmail: targetEmail })
      return NextResponse.json({ count }, { status: 200 })
    }

    let list = await Password.find({ ownerEmail: session.user.email })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean()

    list = list.map((item) => ({
      ...item,
      password: decrypt(item.password)
    }))

    return NextResponse.json({ success: true, data: list }, { status: 200 })
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Server error";

    console.error("❌ GET /api/password error:", message);
    return NextResponse.json({ error: "Server error", message }, { status: 500 });
  }
}

// DELETE → Remove one password entry
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Missing password ID" }, { status: 400 })
    }

    await connectDB()
    await Password.deleteOne({ _id: id, ownerEmail: session.user.email })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("DELETE /api/password error:", err)
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
      return NextResponse.json({ error: "Missing password ID" }, { status: 400 })
    }

    const parsed = bodySchema.safeParse(rest)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", issues: parsed.error.flatten() },
        { status: 422 }
      )
    }

    await connectDB()
    const updated = await Password.findOneAndUpdate(
      { _id: id, ownerEmail: session.user.email },
      {
        $set: {
          ...parsed.data,
          password: encrypt(parsed.data.password)
        }
      },
      { new: true }
    )

    if (!updated) {
      return NextResponse.json({ error: "Password not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: updated })
  } catch (err) {
    console.error("❌ PUT /api/password error:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}