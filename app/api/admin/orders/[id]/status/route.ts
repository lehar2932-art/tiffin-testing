import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import Notification from "@/models/Notification";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectMongoDB();
    const { status } = await request.json();

    const order = await Order.findByIdAndUpdate(
      params.id,
      { status },
      { new: true }
    )
      .populate("consumerId", "name")
      .populate("providerId", "businessName");

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    await Promise.all([
      new Notification({
        userId: order.consumerId,
        title: "Order Status Updated",
        message: `Your order status has been updated to ${status} by admin.`,
        type: "order",
        data: { orderId: order._id, status },
      }).save(),

      new Notification({
        userId: order.providerId,
        title: "Order Status Updated",
        message: `Order ${order._id
          .toString()
          .slice(-8)} status updated to ${status} by admin.`,
        type: "order",
        data: { orderId: order._id, status },
      }).save(),
    ]);

    return NextResponse.json({
      message: "Order status updated successfully",
      order,
    });
  } catch (error) {
    console.error("Update order status error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
