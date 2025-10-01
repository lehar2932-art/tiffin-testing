export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import Review from "@/models/Review";
import ServiceProvider from "@/models/ServiceProvider";

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    const role = request.headers.get("x-user-role");
    if (role !== "provider") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectMongoDB();

    const { searchParams } = new URL(request.url);
    const range = searchParams.get("range") || "30days";

    // Get provider ID
    const provider = await ServiceProvider.findOne({ userId: userId });
    if (!provider) {
      return NextResponse.json(
        { error: "Provider not found" },
        { status: 404 }
      );
    }

    // Calculate date range
    const now = new Date();
    let startDate = new Date();

    switch (range) {
      case "7days":
        startDate.setDate(now.getDate() - 7);
        break;
      case "30days":
        startDate.setDate(now.getDate() - 30);
        break;
      case "90days":
        startDate.setDate(now.getDate() - 90);
        break;
      case "1year":
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    // Orders analytics
    const orderStats = await Order.aggregate([
      {
        $match: {
          providerId: provider._id,
          createdAt: { $gte: startDate },
        },
      },
      {
        $facet: {
          totalOrders: [{ $count: "count" }],
          totalRevenue: [
            {
              $match: { paymentStatus: "paid" },
            },
            {
              $group: {
                _id: null,
                total: { $sum: "$totalAmount" },
              },
            },
          ],
          averageOrderValue: [
            {
              $match: { paymentStatus: "paid" },
            },
            {
              $group: {
                _id: null,
                avg: { $avg: "$totalAmount" },
              },
            },
          ],
          ordersByStatus: [
            {
              $group: {
                _id: "$status",
                count: { $sum: 1 },
              },
            },
          ],
          ordersByDay: [
            {
              $group: {
                _id: {
                  year: { $year: "$createdAt" },
                  month: { $month: "$createdAt" },
                  day: { $dayOfMonth: "$createdAt" },
                },
                orders: { $sum: 1 },
                revenue: {
                  $sum: {
                    $cond: [
                      { $eq: ["$paymentStatus", "paid"] },
                      "$totalAmount",
                      0,
                    ],
                  },
                },
              },
            },
            {
              $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 },
            },
            {
              $project: {
                date: {
                  $dateFromParts: {
                    year: "$_id.year",
                    month: "$_id.month",
                    day: "$_id.day",
                  },
                },
                orders: 1,
                revenue: 1,
              },
            },
          ],
          topItems: [
            { $unwind: "$items" },
            {
              $group: {
                _id: "$items.name",
                quantity: { $sum: "$items.quantity" },
                revenue: {
                  $sum: { $multiply: ["$items.price", "$items.quantity"] },
                },
              },
            },
            { $sort: { quantity: -1 } },
            { $limit: 10 },
          ],
        },
      },
    ]);

    // Reviews analytics
    const reviewStats = await Review.aggregate([
      {
        $match: {
          providerId: provider._id,
          createdAt: { $gte: startDate },
        },
      },
      {
        $facet: {
          averageRating: [
            {
              $group: {
                _id: null,
                avg: { $avg: "$rating" },
                count: { $sum: 1 },
              },
            },
          ],
          ratingDistribution: [
            {
              $group: {
                _id: "$rating",
                count: { $sum: 1 },
              },
            },
            { $sort: { _id: 1 } },
          ],
          recentReviews: [
            { $sort: { createdAt: -1 } },
            { $limit: 5 },
            {
              $lookup: {
                from: "users",
                localField: "consumerId",
                foreignField: "_id",
                as: "consumer",
              },
            },
            { $unwind: "$consumer" },
            {
              $project: {
                rating: 1,
                comment: 1,
                createdAt: 1,
                "consumer.name": 1,
              },
            },
          ],
        },
      },
    ]);

    // Customer analytics
    const customerStats = await Order.aggregate([
      {
        $match: {
          providerId: provider._id,
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: "$consumerId",
          orderCount: { $sum: 1 },
          totalSpent: {
            $sum: {
              $cond: [{ $eq: ["$paymentStatus", "paid"] }, "$totalAmount", 0],
            },
          },
          lastOrder: { $max: "$createdAt" },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "customer",
        },
      },
      { $unwind: "$customer" },
      { $sort: { totalSpent: -1 } },
      { $limit: 10 },
      {
        $project: {
          "customer.name": 1,
          "customer.email": 1,
          orderCount: 1,
          totalSpent: 1,
          lastOrder: 1,
        },
      },
    ]);

    const analytics = {
      overview: {
        totalOrders: orderStats[0].totalOrders[0]?.count || 0,
        totalRevenue: orderStats[0].totalRevenue[0]?.total || 0,
        averageOrderValue: orderStats[0].averageOrderValue[0]?.avg || 0,
        averageRating: reviewStats[0].averageRating[0]?.avg || 0,
        totalReviews: reviewStats[0].averageRating[0]?.count || 0,
      },
      ordersByStatus: orderStats[0].ordersByStatus,
      ordersByDay: orderStats[0].ordersByDay,
      topItems: orderStats[0].topItems,
      ratingDistribution: reviewStats[0].ratingDistribution,
      recentReviews: reviewStats[0].recentReviews,
      topCustomers: customerStats,
    };

    return NextResponse.json({ analytics });
  } catch (error) {
    console.error("Get provider analytics error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
