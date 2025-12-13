// /api/mobile-github-start/route.ts
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const next = url.searchParams.get("next") || "nopassmobile://redirect";

  const githubClientId = (process.env.GITHUB_MOBILE_ID as string) || "";

  const isMobile = url.searchParams.has("next");

  const backendBase =
    isMobile
      ? (process.env.MOBILE_API_URL as string)
      : (process.env.NEXTAUTH_URL as string);

  const callback = `${backendBase.replace(/\/$/, "")}/api/mobile-github-auth`;

  const authorizeUrl =
    `https://github.com/login/oauth/authorize` +
    `?client_id=${encodeURIComponent(githubClientId)}` +
    `&redirect_uri=${encodeURIComponent(callback)}` +
    `&scope=user:email` +
    `&state=${encodeURIComponent(next)}`;

  return NextResponse.redirect(authorizeUrl);
}