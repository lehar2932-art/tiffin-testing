import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function DELETE(request: NextRequest) {
  try {
    await connectMongoDB();
    const userId = request.headers.get("x-user-id");
    await User.findByIdAndDelete(userId);
    const response = NextResponse.json({
      message: "Account deleted permanently",
    });
    response.cookies.set("token", "", { maxAge: 0 });
    return response;
  } catch (error) {
    console.error("Delete-account error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
