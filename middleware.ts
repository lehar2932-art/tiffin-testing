import { NextRequest, NextResponse } from "next/server";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";
import { TDecoded } from "@/types";

type Role = "admin" | "provider" | "consumer";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (
    pathname.startsWith("/api/auth/login") ||
    pathname.startsWith("/api/auth/register")
  ) {
    return NextResponse.next();
  }

  let requiredRole: Role | undefined;

  if (pathname.startsWith("/api/admin")) {
    requiredRole = "admin";
  } else if (pathname.startsWith("/api/provider")) {
    requiredRole = "provider";
  }

  const token = getTokenFromRequest(request);
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const decoded = await verifyToken(token);
  if (!decoded) {
    return NextResponse.json(
      { error: "Invalid or expired token" },
      { status: 401 }
    );
  }

  if (requiredRole && decoded.role !== requiredRole) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const response = NextResponse.next();
  response.headers.set("x-user-id", decoded.userId);
  response.headers.set("x-user-role", decoded.role);
  response.headers.set("x-user-token-version", decoded.tokenVersion);

  return response;
}

export const config = {
  matcher: ["/api/:path*"],
};
