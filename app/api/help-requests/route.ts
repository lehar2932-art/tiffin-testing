import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import HelpRequest from "@/models/HelpRequest";
import Notification from "@/models/Notification";
import User from "@/models/User";

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    const role = request.headers.get("x-user-role");

    console.log("userId", userId);
    await connectMongoDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const type = searchParams.get("type");
    const priority = searchParams.get("priority");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const skip = (page - 1) * limit;

    let query: any = {};

    if (role === "admin") {
      if (type !== "consumer_to_provider") {
        query = {
          $or: [{ type: "admin_support" }, { type: "provider_support" }],
        };
      }
    } else {
      console.log("firstsssss");
      query = {
        $or: [{ fromUserId: userId }, { toUserId: userId }],
      };
    }

    // if (status) query.status = status;
    // if (type && type !== "all") query.type = type;
    // if (priority) query.priority = priority;
    console.log("userId", userId);
    const helpRequests = await HelpRequest.find(query)
      .populate("fromUserId", "name email role")
      .populate("toUserId", "name email role")
      .populate("responses.userId", "name role")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await HelpRequest.countDocuments(query);

    return NextResponse.json({
      helpRequests,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        count: helpRequests.length,
        totalRecords: total,
      },
    });
  } catch (error) {
    console.error("Get help requests error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");

    await connectMongoDB();
    const { toUserId, type, subject, message, priority, category } =
      await request.json();
    let payload: any = {
      fromUserId: userId,
      type,
      subject,
      message,
      priority: priority || "medium",
      category: category || "general",
    };

    if (toUserId) {
      payload = {
        ...payload,
        toUserId,
      };
    }

    const helpRequest = new HelpRequest(payload);

    await helpRequest.save();

    const recipientId =
      type === "admin_support" || type === "provider_support" ? null : toUserId;
    const admins = await User.find({ role: "admin" });

    if (type === "admin_support" || type === "provider_support") {
      for (const admin of admins) {
        await new Notification({
          userId: admin._id,
          title: "New Help Request",
          message: `You have received a new help request: ${subject}`,
          type: "system",
          data: { helpRequestId: helpRequest._id, type },
        }).save();
      }
    }
    if (recipientId) {
      await new Notification({
        userId: recipientId,
        title: "New Help Request",
        message: `You have received a new help request: ${subject}`,
        type: "system",
        data: { helpRequestId: helpRequest._id, type },
      }).save();
    }

    return NextResponse.json(
      { message: "Help request created successfully", helpRequest },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create help request error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
