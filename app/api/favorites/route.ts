import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import User from "@/models/User";
import ServiceProvider from "@/models/ServiceProvider";

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    const role = request.headers.get("x-user-role");
    if (role !== "consumer") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectMongoDB();

    const user = await User.findById(userId);
    const favoriteIds = user.favorites || [];

    const favorites = await ServiceProvider.find({
      _id: { $in: favoriteIds },
    }).populate("userId", "name email");

    return NextResponse.json({ favorites });
  } catch (error) {
    console.error("Get favorites error:", error);
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
    const { providerId } = await request.json();

    const user = await User.findById(userId);
    const favorites = user.favorites || [];

    if (!favorites.includes(providerId)) {
      favorites.push(providerId);
      await User.findByIdAndUpdate(userId, { favorites });
    }

    return NextResponse.json({ message: "Added to favorites" });
  } catch (error) {
    console.error("Add favorite error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    const role = request.headers.get("x-user-role");
    if (role !== "consumer") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectMongoDB();
    const { searchParams } = new URL(request.url);
    const providerId = searchParams.get("providerId");

    const user = await User.findById(userId);
    const favorites = (user.favorites || []).filter(
      (id: string) => id.toString() !== providerId
    );

    await User.findByIdAndUpdate(userId, { favorites });

    return NextResponse.json({ message: "Removed from favorites" });
  } catch (error) {
    console.error("Remove favorite error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
