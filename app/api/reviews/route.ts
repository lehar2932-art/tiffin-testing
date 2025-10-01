import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import Review from "@/models/Review";
import ServiceProvider from "@/models/ServiceProvider";

export async function GET(request: NextRequest) {
  try {
    await connectMongoDB();

    const { searchParams } = new URL(request.url);
    const providerId = searchParams.get("providerId");
    const consumerId = searchParams.get("consumerId");

    const query: any = {};
    if (providerId) query.providerId = providerId;
    if (consumerId) query.consumerId = consumerId;

    const reviews = await Review.find(query)
      .populate("consumerId", "name")
      .populate("providerId", "businessName")
      .populate("orderId", "totalAmount createdAt")
      .sort({ createdAt: -1 });

    return NextResponse.json({ reviews });
  } catch (error) {
    console.error("Get reviews error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    const role = request.headers.get("x-user-role");
    if (role !== "consumer") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectMongoDB();
    const { providerId, orderId, rating, comment } = await request.json();

    // Check if review already exists for this order
    const existingReview = await Review.findOne({
      consumerId: userId,
      orderId,
    });

    if (existingReview) {
      return NextResponse.json(
        { error: "Review already exists for this order" },
        { status: 400 }
      );
    }

    const review = new Review({
      consumerId: userId,
      providerId,
      orderId,
      rating,
      comment,
      isVerified: true, // Mark as verified since it's from a completed order
    });

    await review.save();

    // Update provider's average rating
    const reviews = await Review.find({ providerId });
    const averageRating =
      reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    await ServiceProvider.findByIdAndUpdate(providerId, {
      rating: Math.round(averageRating * 10) / 10,
    });

    return NextResponse.json(
      { message: "Review added successfully", review },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create review error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
