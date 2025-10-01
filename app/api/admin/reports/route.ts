export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import User from "@/models/User";

export async function GET(request: NextRequest) {
  try {
    await connectMongoDB();

    const { searchParams } = new URL(request.url);
    const range = searchParams.get("range") || "6months";

    // Calculate date range
    const now = new Date();
    let startDate = new Date();

    switch (range) {
      case "1month":
        startDate.setMonth(now.getMonth() - 1);
        break;
      case "3months":
        startDate.setMonth(now.getMonth() - 3);
        break;
      case "6months":
        startDate.setMonth(now.getMonth() - 6);
        break;
      case "1year":
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    // Orders by month
    const ordersByMonth = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          orders: { $sum: 1 },
          revenue: {
            $sum: {
              $cond: [{ $eq: ["$paymentStatus", "paid"] }, "$totalAmount", 0],
            },
          },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 },
      },
      {
        $project: {
          month: {
            $concat: [
              { $toString: "$_id.year" },
              "-",
              { $toString: "$_id.month" },
            ],
          },
          orders: 1,
          revenue: 1,
        },
      },
    ]);

    // Orders by status
    const ordersByStatus = await Order.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          status: "$_id",
          count: 1,
          percentage: {
            $multiply: [{ $divide: ["$count", { $sum: "$count" }] }, 100],
          },
        },
      },
    ]);

    // Top providers
    const topProviders = await Order.aggregate([
      {
        $group: {
          _id: "$providerId",
          orders: { $sum: 1 },
          revenue: {
            $sum: {
              $cond: [{ $eq: ["$paymentStatus", "paid"] }, "$totalAmount", 0],
            },
          },
        },
      },
      {
        $lookup: {
          from: "serviceproviders",
          localField: "_id",
          foreignField: "_id",
          as: "provider",
        },
      },
      {
        $unwind: "$provider",
      },
      {
        $project: {
          name: "$provider.businessName",
          orders: 1,
          revenue: 1,
        },
      },
      {
        $sort: { revenue: -1 },
      },
      {
        $limit: 10,
      },
    ]);

    // User growth
    const userGrowth = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            role: "$role",
          },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: {
            year: "$_id.year",
            month: "$_id.month",
          },
          users: { $sum: "$count" },
          providers: {
            $sum: {
              $cond: [{ $eq: ["$_id.role", "provider"] }, "$count", 0],
            },
          },
          consumers: {
            $sum: {
              $cond: [{ $eq: ["$_id.role", "consumer"] }, "$count", 0],
            },
          },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 },
      },
      {
        $project: {
          month: {
            $concat: [
              { $toString: "$_id.year" },
              "-",
              { $toString: "$_id.month" },
            ],
          },
          users: 1,
          providers: 1,
          consumers: 1,
        },
      },
    ]);

    // Revenue metrics
    const revenueMetrics = await Order.aggregate([
      {
        $facet: {
          totalRevenue: [
            {
              $match: {
                paymentStatus: "paid",
                createdAt: { $gte: startDate },
              },
            },
            {
              $group: {
                _id: null,
                total: { $sum: "$totalAmount" },
              },
            },
          ],
          totalOrders: [
            {
              $match: {
                createdAt: { $gte: startDate },
              },
            },
            {
              $count: "total",
            },
          ],
          averageOrderValue: [
            {
              $match: {
                paymentStatus: "paid",
                createdAt: { $gte: startDate },
              },
            },
            {
              $group: {
                _id: null,
                avg: { $avg: "$totalAmount" },
              },
            },
          ],
        },
      },
    ]);

    const reports = {
      ordersByMonth,
      ordersByStatus,
      topProviders,
      userGrowth,
      revenueMetrics: {
        totalRevenue: revenueMetrics[0].totalRevenue[0]?.total || 0,
        totalOrders: revenueMetrics[0].totalOrders[0]?.total || 0,
        averageOrderValue: revenueMetrics[0].averageOrderValue[0]?.avg || 0,
        monthlyGrowth: 12.5, // This would be calculated based on previous period
      },
    };

    return NextResponse.json({ reports });
  } catch (error) {
    console.error("Get reports error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
