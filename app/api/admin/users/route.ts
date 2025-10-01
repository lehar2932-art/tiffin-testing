export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    const arole = request.headers.get("x-user-role");
    if (arole !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectMongoDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const role = searchParams.get("role");
    const status = searchParams.get("status");

    const skip = (page - 1) * limit;

    // Build query
    const query: any = {};
    if (role) query.role = role;
    if (status) query.isActive = status === "active";

    const users = await User.find(query)
      .select("-password")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    return NextResponse.json({
      users,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        count: users.length,
        totalRecords: total,
      },
    });
  } catch (error) {
    console.error("Get users error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
