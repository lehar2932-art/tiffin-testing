import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    await connectMongoDB();

    await User.findByIdAndUpdate(userId, {
      $inc: { tokenVersion: 1 },
    });

    const response = NextResponse.json({
      message: "Logged out from all devices",
    });
    response.cookies.set("token", "", { maxAge: 0 });
    return response;
  } catch (error) {
    console.error("Logout-all error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
