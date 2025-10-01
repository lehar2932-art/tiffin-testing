import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import ServiceProvider from "@/models/ServiceProvider";
import Notification from "@/models/Notification";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectMongoDB();
    const { isVerified } = await request.json();

    const provider = await ServiceProvider.findByIdAndUpdate(
      params.id,
      { isVerified },
      { new: true }
    ).populate("userId", "name email");

    if (!provider) {
      return NextResponse.json(
        { error: "Provider not found" },
        { status: 404 }
      );
    }

    // Create notification for provider
    await new Notification({
      userId: provider.userId._id,
      title: isVerified ? "Account Verified!" : "Verification Removed",
      message: isVerified
        ? "Congratulations! Your provider account has been verified by our admin team."
        : "Your provider verification has been removed. Please contact support for more information.",
      type: "system",
    }).save();

    return NextResponse.json({
      message: `Provider ${
        isVerified ? "verified" : "unverified"
      } successfully`,
      provider,
    });
  } catch (error) {
    console.error("Verify provider error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
