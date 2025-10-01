export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    const tokenVersion = request.headers.get("x-user-token-version");
    await connectMongoDB();

    const user = await User.findById(userId).select("-password");
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    // if (Number(tokenVersion) !== Number(user.tokenVersion)) {
    //   return NextResponse.json(
    //     { error: "Invalid or expired token" },
    //     { status: 401 }
    //   );
    // }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
