import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import Notification from "@/models/Notification";

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");

    await connectMongoDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const unreadOnly = searchParams.get("unreadOnly") === "true";

    const skip = (page - 1) * limit;

    const query: any = { userId: userId };
    if (unreadOnly) query.isRead = false;

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({
      userId: userId,
      isRead: false,
    });

    return NextResponse.json({
      notifications,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        count: notifications.length,
        totalRecords: total,
      },
      unreadCount,
    });
  } catch (error) {
    console.error("Get notifications error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    const role = request.headers.get("x-user-role");

    await connectMongoDB();
    const { notificationIds, markAsRead } = await request.json();

    const updateQuery =
      notificationIds && notificationIds.length > 0
        ? { _id: { $in: notificationIds }, userId: userId }
        : { userId: userId };

    await Notification.updateMany(updateQuery, { isRead: markAsRead });

    return NextResponse.json({ message: "Notifications updated successfully" });
  } catch (error) {
    console.error("Update notifications error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
