// ==========================================
// FILE: middleware.ts (ALLOWED CORS POLICY)
// ==========================================

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Get allowed origins from environment variable
const getAllowedOrigins = (): string[] => {
    const origins = process.env.ALLOWED_ORIGINS || "";
    return origins.split(",").filter(Boolean);
};

// Get allowed mobile schemes from environment variable
const getAllowedMobileSchemes = (): string[] => {
    const schemes = process.env.ALLOWED_MOBILE_SCHEMES || "exp://,nopassmobile://";
    return schemes.split(",").filter(Boolean);
};

// Security configuration
const allowedMethods = ["GET", "POST", "PUT", "DELETE", "OPTIONS"];
const allowedHeaders = [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
];

export function middleware(request: NextRequest) {
    const origin = request.headers.get("origin");
    const requestMethod = request.method;

    // Check if request is from allowed origin or mobile app
    const allowedOrigins = getAllowedOrigins();
    const allowedMobileSchemes = getAllowedMobileSchemes();

    const isAllowedOrigin = origin && allowedOrigins.includes(origin);
    const isMobileApp = !origin || allowedMobileSchemes.some(scheme =>
        origin?.startsWith(scheme)
    );
    const isLocalhost = origin?.includes("localhost") || origin?.includes("192.168");

    // For development, allow localhost
    const isDevelopment = process.env.NODE_ENV === "development";
    const isAllowed = isAllowedOrigin || isMobileApp || (isDevelopment && isLocalhost);

    // Handle preflight OPTIONS requests
    if (requestMethod === "OPTIONS") {
        return new NextResponse(null, {
            status: 204,
            headers: {
                "Access-Control-Allow-Origin": isAllowed ? (origin || "*") : "null",
                "Access-Control-Allow-Methods": allowedMethods.join(", "),
                "Access-Control-Allow-Headers": allowedHeaders.join(", "),
                "Access-Control-Max-Age": "86400",
                "Access-Control-Allow-Credentials": "true",
            },
        });
    }

    // SECURITY: Block unauthorized origins (only in production)
    if (!isDevelopment && !isAllowed) {
        console.warn(`🚫 CORS blocked: ${origin}`);
        return new NextResponse(
            JSON.stringify({
                success: false,
                message: "CORS policy: Origin not allowed",
            }),
            {
                status: 403,
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );
    }

    // Handle regular requests
    const response = NextResponse.next();

    // Set CORS headers
    response.headers.set(
        "Access-Control-Allow-Origin",
        isAllowed ? (origin || "*") : "null"
    );
    response.headers.set(
        "Access-Control-Allow-Methods",
        allowedMethods.join(", ")
    );
    response.headers.set(
        "Access-Control-Allow-Headers",
        allowedHeaders.join(", ")
    );
    response.headers.set("Access-Control-Allow-Credentials", "true");

    // Additional security headers
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("X-XSS-Protection", "1; mode=block");

    // Only set HSTS in production with HTTPS
    if (process.env.NODE_ENV === "production") {
        response.headers.set(
            "Strict-Transport-Security",
            "max-age=31536000; includeSubDomains; preload"
        );
    }

    return response;
}

// Apply middleware only to API routes
export const config = {
    matcher: "/api/:path*",
};