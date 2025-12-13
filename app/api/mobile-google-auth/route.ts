// /api/mobile-google-auth/route.ts
import { NextResponse, NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state") || "nopassmobile://redirect";

    if (!code) {
      return NextResponse.json(
        { success: false, message: "Missing code" },
        { status: 400 }
      );
    }

    const clientId = process.env.GOOGLE_MOBILE_CLIENT_ID!;
    const clientSecret = process.env.GOOGLE_MOBILE_CLIENT_SECRET!;
    const redirectUri = `${(process.env.MOBILE_API_URL || process.env.NEXTAUTH_URL)!.replace(/\/$/, "")}/api/mobile-google-auth`;

    // Exchange code → access_token
    const tokenRes = await fetch(
      `https://oauth2.googleapis.com/token`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          code,
          grant_type: "authorization_code",
          redirect_uri: redirectUri,
        }),
      }
    );

    const tokenData = await tokenRes.json();
    const googleAccessToken = tokenData.access_token;

    if (!googleAccessToken) {
      return NextResponse.json(
        { success: false, message: "Google token exchange failed" },
        { status: 400 }
      );
    }

    // Get Google profile
    const profileRes = await fetch(
      `https://www.googleapis.com/oauth2/v3/userinfo`,
      {
        headers: { Authorization: `Bearer ${googleAccessToken}` },
      }
    );

    const profile = await profileRes.json();
    const email = profile.email;

    // If email hidden → fetch emails list API
    let finalEmail = email;
    if (!finalEmail) {
      const emailRes = await fetch(
        `https://www.googleapis.com/oauth2/v3/userinfo`,
        {
          headers: { Authorization: `Bearer ${googleAccessToken}` },
        }
      );
      const emailData = await emailRes.json();
      finalEmail = emailData.email;
    }

    if (!finalEmail) {
      return NextResponse.json(
        { success: false, message: "Google email not found" },
        { status: 400 }
      );
    }

    // DB operations
    await connectDB();
    let user = await User.findOne({ email: finalEmail });

    if (!user) {
      user = await User.create({
        name: profile.name || finalEmail,
        email: finalEmail,
        provider: "google",
        image: profile.picture || "",
        lastLogin: new Date(),
      });
    } else {
      user.lastLogin = new Date();
      await user.save();
    }

    // JWT for Mobile App
    const token = jwt.sign(
      { id: String(user._id), email: user.email },
      process.env.NEXTAUTH_SECRET!,
      { expiresIn: "30d" }
    );

    // Redirect back to App with Token
    const redirectUrl = `${state}?token=${token}`;
    return NextResponse.redirect(redirectUrl);
  } catch (err) {
    console.error("MOBILE GOOGLE AUTH ERROR:", err);
    return NextResponse.json(
      { success: false, message: "Server Error", err },
      { status: 500 }
    );
  }
}