import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import ServiceProvider from "@/models/ServiceProvider";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectMongoDB();
    const updateData = await request.json();

    const provider = await ServiceProvider.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true }
    ).populate("userId", "name email phone");

    if (!provider) {
      return NextResponse.json(
        { error: "Provider not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Provider updated successfully",
      provider,
    });
  } catch (error) {
    console.error("Update provider error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
