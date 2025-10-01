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
    const rating = searchParams.get("rating");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const search = searchParams.get("search");

    const skip = (page - 1) * limit;

    const query: any = {};
    if (providerId) query.providerId = providerId;
    if (consumerId) query.consumerId = consumerId;
    if (rating) query.rating = parseInt(rating);

    const sortOptions: any = {};
    sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;

    let reviews = await Review.find(query)
      .populate("consumerId", "name email")
      .populate("providerId", "businessName")
      .populate("orderId", "totalAmount createdAt")
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);

    // Apply search filter if provided
    if (search) {
      reviews = reviews.filter(
        (review) =>
          review.consumerId.name.toLowerCase().includes(search.toLowerCase()) ||
          review.providerId.businessName
            .toLowerCase()
            .includes(search.toLowerCase()) ||
          review.comment?.toLowerCase().includes(search.toLowerCase())
      );
    }

    const total = await Review.countDocuments(query);

    // Get all providers for filter dropdown
    const providers = await ServiceProvider.find({}, "businessName").sort({
      businessName: 1,
    });

    // Calculate review statistics
    const stats = await Review.aggregate([
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 },
          ratingDistribution: {
            $push: "$rating",
          },
        },
      },
    ]);

    const ratingCounts = [1, 2, 3, 4, 5].map((rating) => ({
      rating,
      count:
        stats[0]?.ratingDistribution?.filter((r: number) => r === rating)
          .length || 0,
    }));

    return NextResponse.json({
      reviews,
      providers,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        count: reviews.length,
        totalRecords: total,
      },
      stats: {
        averageRating: stats[0]?.averageRating || 0,
        totalReviews: stats[0]?.totalReviews || 0,
        ratingDistribution: ratingCounts,
      },
    });
  } catch (error) {
    console.error("Get admin reviews error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await connectMongoDB();
    const { reviewId } = await request.json();

    await Review.findByIdAndDelete(reviewId);

    return NextResponse.json({ message: "Review deleted successfully" });
  } catch (error) {
    console.error("Delete review error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
