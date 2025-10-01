import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import HelpRequest from "@/models/HelpRequest";
import Notification from "@/models/Notification";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = request.headers.get("x-user-id");
    const role = request.headers.get("x-user-role");

    await connectMongoDB();

    const helpRequest = await HelpRequest.findById(params.id)
      .populate("fromUserId", "name email role")
      .populate("toUserId", "name email role")
      .populate("responses.userId", "name role");

    if (!helpRequest) {
      return NextResponse.json(
        { error: "Help request not found" },
        { status: 404 }
      );
    }

    // Check permissions
    const canView =
      role === "admin" ||
      helpRequest.fromUserId._id.toString() === userId ||
      helpRequest.toUserId?._id.toString() === userId;

    if (!canView) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ helpRequest });
  } catch (error) {
    console.error("Get help request error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = request.headers.get("x-user-id");
    const role = request.headers.get("x-user-role");

    await connectMongoDB();
    const { status, priority, response } = await request.json();

    const helpRequest = await HelpRequest.findById(params.id);
    if (!helpRequest) {
      return NextResponse.json(
        { error: "Help request not found" },
        { status: 404 }
      );
    }

    // Check permissions
    const canUpdate =
      role === "admin" ||
      helpRequest.fromUserId.toString() === userId ||
      helpRequest.toUserId?.toString() === userId;

    if (!canUpdate) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Update status and priority if provided
    if (status) {
      helpRequest.status = status;
      if (status === "resolved") {
        helpRequest.resolvedAt = new Date();
        helpRequest.resolvedBy = userId;
      }
    }
    if (priority) helpRequest.priority = priority;

    // Add response if provided
    if (response) {
      helpRequest.responses.push({
        userId: userId,
        message: response,
        timestamp: new Date(),
        isAdmin: role === "admin",
      });

      // Create notification for the other party
      const notifyUserId =
        helpRequest.fromUserId.toString() === userId
          ? helpRequest.toUserId
          : helpRequest.fromUserId;

      if (notifyUserId) {
        await new Notification({
          userId: notifyUserId,
          title: "Help Request Response",
          message: `You have received a response to your help request: ${helpRequest.subject}`,
          type: "system",
          data: { helpRequestId: helpRequest._id },
        }).save();
      }
    }

    await helpRequest.save();

    return NextResponse.json({
      message: "Help request updated successfully",
      helpRequest,
    });
  } catch (error) {
    console.error("Update help request error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
