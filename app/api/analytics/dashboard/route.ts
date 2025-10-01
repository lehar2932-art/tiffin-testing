export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import User from "@/models/User";
import ServiceProvider from "@/models/ServiceProvider";

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    const role = request.headers.get("x-user-role");

    await connectMongoDB();

    let analytics = {};

    if (role === "admin") {
      // Admin analytics
      const totalUsers = await User.countDocuments();
      const totalProviders = await ServiceProvider.countDocuments();
      const totalOrders = await Order.countDocuments();
      const totalRevenue = await Order.aggregate([
        { $match: { paymentStatus: "paid" } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]);

      // Orders by status
      const ordersByStatus = await Order.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]);

      // Recent orders
      const recentOrders = await Order.find()
        .populate("consumerId", "name")
        .populate("providerId", "businessName")
        .sort({ createdAt: -1 })
        .limit(10);

      analytics = {
        totalUsers,
        totalProviders,
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        ordersByStatus,
        recentOrders,
      };
    } else if (role === "provider") {
      // Provider analytics
      const totalOrders = await Order.countDocuments({
        providerId: userId,
      });
      const totalRevenue = await Order.aggregate([
        { $match: { providerId: userId, paymentStatus: "paid" } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]);

      const ordersByStatus = await Order.aggregate([
        { $match: { providerId: userId } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]);

      const recentOrders = await Order.find({ providerId: userId })
        .populate("consumerId", "name")
        .sort({ createdAt: -1 })
        .limit(10);

      analytics = {
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        ordersByStatus,
        recentOrders,
      };
    } else {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ analytics });
  } catch (error) {
    console.error("Get analytics error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
