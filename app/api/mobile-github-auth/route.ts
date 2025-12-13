// /api/mobile-github-auth/route.ts
import { NextResponse, NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

interface GitHubEmail {
  email: string;
  primary: boolean;
  verified: boolean;
  visibility: string | null;
}

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

    const clientId = process.env.GITHUB_MOBILE_ID!;
    const clientSecret = process.env.GITHUB_MOBILE_SECRET!;

    // 1️Exchange code → access_token
    const tokenRes = await fetch(
      `https://github.com/login/oauth/access_token`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          code,
        }),
      }
    );

    const tokenData = await tokenRes.json();
    const githubAccessToken = tokenData.access_token;

    if (!githubAccessToken) {
      return NextResponse.json(
        { success: false, message: "GitHub token exchange failed" },
        { status: 400 }
      );
    }

    // Get GitHub profile
    const profileRes = await fetch(
      `https://api.github.com/user`,
      {
        headers: { Authorization: `Bearer ${githubAccessToken}` },
      }
    );

    const profile = await profileRes.json();
    const email = profile.email;

    // If email hidden → fetch emails list API
    let finalEmail = email;
    if (!finalEmail) {
      const emailRes = await fetch(
        `https://api.github.com/user/emails`,
        {
          headers: { Authorization: `Bearer ${githubAccessToken}` },
        }
      );
      const emails: GitHubEmail[] = await emailRes.json();
      finalEmail = emails.find((e) => e.primary)?.email;
    }

    if (!finalEmail) {
      return NextResponse.json(
        { success: false, message: "GitHub email not found" },
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
        provider: "github",
        image: profile.avatar_url || "",
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
    console.error("MOBILE GITHUB AUTH ERROR:", err);
    return NextResponse.json(
      { success: false, message: "Server Error", err },
      { status: 500 }
    );
  }
}
