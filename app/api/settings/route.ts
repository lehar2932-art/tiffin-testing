import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");

    await connectMongoDB();
    const user = await User.findById(userId).select("settings");

    const defaultSettings = {
      notifications: {
        email: true,
        sms: false,
        push: true,
        orderUpdates: true,
        promotions: false,
        weeklyDigest: true,
      },
      privacy: {
        profileVisibility: "public",
        showOrderHistory: false,
        dataCollection: true,
        marketing: false,
      },
      preferences: {
        language: "en",
        timezone: "Asia/Kolkata",
        currency: "INR",
      },
      provider: {
        autoAcceptOrders: false,
        maxOrdersPerDay: 0,
        preparationTime: 0,
        deliveryRadius: 0,
      },
    };

    const settings = user?.settings || defaultSettings;

    return NextResponse.json({
      data: settings,
      message: "Settings fetched successfully",
    });
  } catch (error) {
    console.error("Get settings error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    const role = request.headers.get("x-user-role");

    await connectMongoDB();
    const settings = await request.json();

    if (role === "provider" && settings.provider) {
      await User.findByIdAndUpdate(userId, {
        settings: {
          notifications: settings.notifications,
          privacy: settings.privacy,
          preferences: settings.preferences,
          provider: settings.provider,
        },
      });
    } else {
      await User.findByIdAndUpdate(userId, {
        settings: {
          notifications: settings.notifications,
          privacy: settings.privacy,
          preferences: settings.preferences,
        },
      });
    }

    return NextResponse.json({ message: "Settings updated successfully" });
  } catch (error) {
    console.error("Update settings error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
