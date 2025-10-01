export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import ServiceProvider from "@/models/ServiceProvider";

export async function GET(request: NextRequest) {
  try {
    await connectMongoDB();

    const query: any = { isActive: true };

    const providers = await ServiceProvider.find(query)
      .populate("userId", "name email phone")
      .sort({ rating: -1, totalOrders: -1 });

    return NextResponse.json({
      data: providers,
      message: "Providers fetched successfully",
    });
  } catch (error) {
    console.error("Get providers error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
