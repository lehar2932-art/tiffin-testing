import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import ServiceProvider from "@/models/ServiceProvider";
import User from "@/models/User";
import Notification from "@/models/Notification";

import { verifyRazorpayPayment } from "@/lib/razorpay";
import {
  sendEmail,
  sendSMS,
  getOrderConfirmationEmail,
  getOrderConfirmationSMS,
} from "@/lib/notifications";

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    const role = request.headers.get("x-user-role");

    await connectMongoDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    // Build query based on user role
    let query: any = {};
    if (role === "consumer") {
      query.consumerId = userId;
    } else if (role === "provider") {
      query.providerId = userId;
    }
    // Admin can see all orders

    if (status) query.status = status;

    const orders = await Order.find(query)
      .populate("consumerId", "name email")
      .populate("providerId", "businessName")
      .sort({ createdAt: -1 });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error("Get orders error:", error);
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
    const {
      providerId,
      items,
      totalAmount,
      deliveryAddress,
      deliveryDate,
      paymentMethod,
      notes,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    } = await request.json();

    // Verify Razorpay payment if payment method is razorpay
    if (paymentMethod === "razorpay") {
      const isValidPayment = verifyRazorpayPayment(
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature
      );

      if (!isValidPayment) {
        return NextResponse.json(
          { error: "Invalid payment signature" },
          { status: 400 }
        );
      }
    }

    const order = new Order({
      providerId,
      items,
      totalAmount,
      deliveryAddress,
      deliveryDate,
      paymentMethod,
      notes,
      consumerId: userId,
      paymentStatus: paymentMethod === "razorpay" ? "paid" : "pending",
      status: "confirmed",
    });

    await order.save();

    // Fetch user and provider details for notifications
    const [consumer, provider] = await Promise.all([
      User.findById(userId),
      ServiceProvider.findById(providerId).populate("userId"),
    ]);

    // Create notifications
    await Promise.all([
      // Consumer notification
      new Notification({
        userId: userId,
        title: "Order Confirmed",
        message: `Your order from ${provider.businessName} has been confirmed.`,
        type: "order",
        data: { orderId: order._id, providerId },
      }).save(),

      // Provider notification
      new Notification({
        userId: provider.userId._id,
        title: "New Order Received",
        message: `You have received a new order from ${consumer.name}.`,
        type: "order",
        data: { orderId: order._id, consumerId: userId },
      }).save(),
    ]);

    // Send email and SMS notifications
    try {
      const orderNotificationData = {
        orderId: order._id.toString().slice(-8),
        customerName: consumer.name,
        providerName: provider.businessName,
        totalAmount: totalAmount,
        deliveryDate: new Date(deliveryDate).toLocaleDateString(),
      };

      // Send email to consumer
      const emailData = getOrderConfirmationEmail(orderNotificationData);
      await sendEmail({
        to: consumer.email,
        ...emailData,
      });

      // Send SMS to consumer if phone number exists
      if (consumer.phone) {
        const smsMessage = getOrderConfirmationSMS(orderNotificationData);
        await sendSMS({
          to: consumer.phone,
          message: smsMessage,
        });
      }
    } catch (notificationError) {
      console.error("Notification error:", notificationError);
      // Don't fail the order creation if notifications fail
    }

    return NextResponse.json(
      { message: "Order placed successfully", order },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create order error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
