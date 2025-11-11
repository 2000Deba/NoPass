import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import Contact from "@/models/Contact";
import { contactSchema } from "@/lib/models/Contact"
import { connectDB } from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export async function POST(req: Request) {
  try {
    // Get Session
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "You must be logged in to send a message." },
        { status: 401 }
      );
    }

    await connectDB();

    // Parse & validate in one line
    const contactData = contactSchema.parse(await req.json());

    // Email must match session email
    if (session.user.email !== contactData.email) {
      return NextResponse.json(
        { error: "You are logged in with a different email address." },
        { status: 403 }
      );
    }

    await Contact.create({
      name: contactData.name,
      ownerEmail: contactData.email,
      subject: contactData.subject,
      message: contactData.message,
    });

    // Mail transport config
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const htmlContent = `
      <div style="font-family:Segoe UI,Arial,sans-serif; padding:0; margin:0; background:#f7f7f9;">
        <div style="max-width:600px; margin:auto; background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.12);">

          <div style="text-align:center; background: linear-gradient(135deg, #ffc08a, #ff7aa4); padding:28px;">
            <img src="cid:nopasslogo" alt="NoPass Logo" style="width:80px; height:auto;" />
          </div>

          <div style="padding:28px;">
            <h2 style="margin:0; font-size:22px; font-weight:600;">Hello ${contactData.name},</h2>
            <p style="margin:14px 0; color:#333; line-height:1.6;">
              Thanks for reaching out to us. We&apos;ve received your message and our team will respond shortly.
            </p>

            <div style="background:#fafafa; border-left:4px solid #ff4b82; padding:16px; border-radius:6px; margin-top:18px;">
              <strong style="color:#111;">Your Message:</strong>
              <p style="white-space:pre-wrap; margin-top:6px;">${contactData.message}</p>
            </div>

            <p style="margin-top:22px; color:#444;">
              If you need urgent assistance, you can reply directly to this email.
            </p>
          </div>

          <div style="text-align:center; padding:16px; color:#888; font-size:13px;">
            &nbsp;Copyright © ${new Date().getFullYear()} NoPass. All Rights Reserved.
          </div>

        </div>
      </div>
      `;

    // Auto-reply to user
    await transporter.sendMail({
      from: `"NoPass Support" <${process.env.EMAIL_USER}>`,
      to: contactData.email,
      subject: `We received your message: ${contactData.subject}`,
      html: htmlContent,
      attachments: [
        {
          filename: "NoPass.png",
          path: `${process.cwd()}/public/NoPass.png`,
          cid: "nopasslogo",
        },
      ],
    });

    return NextResponse.json({ success: true });

  } catch (error: unknown) {
    console.error("CONTACT API ERROR:", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
