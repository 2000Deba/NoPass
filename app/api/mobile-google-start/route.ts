// /api/mobile-google-start/route.ts
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const url = new URL(req.url);
    const next = url.searchParams.get("next") || "nopassmobile://redirect";

    const googleClientId = (process.env.GOOGLE_MOBILE_CLIENT_ID as string) || "";

    const isMobile = url.searchParams.has("next");

    const backendBase =
        isMobile
            ? (process.env.MOBILE_API_URL as string)
            : (process.env.NEXTAUTH_URL as string);

    const callback = `${backendBase.replace(/\/$/, "")}/api/mobile-google-auth`;

    const authorizeUrl =
        `https://accounts.google.com/o/oauth2/v2/auth` +
        `?client_id=${encodeURIComponent(googleClientId)}` +
        `&redirect_uri=${encodeURIComponent(callback)}` +
        `&response_type=code` +
        `&scope=${encodeURIComponent("openid email profile")}` +
        `&access_type=offline` +
        `&prompt=consent` +
        `&include_granted_scopes=true` +
        `&state=${encodeURIComponent(next)}`;

    return NextResponse.redirect(authorizeUrl);
}