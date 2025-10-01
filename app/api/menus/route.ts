import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import Menu from "@/models/Menu";
import { Types } from "mongoose";

import User from "@/models/User";
import ServiceProvider from "@/models/ServiceProvider";

export async function GET(request: NextRequest) {
  try {
    await connectMongoDB();

    const { searchParams } = new URL(request.url);
    const providerId = searchParams.get("providerId");
    const category = searchParams.get("category");
    const query: any = { isActive: true };

    if (providerId) {
      const serviceProvider = await ServiceProvider.findById(providerId);
      query.providerId = new Types.ObjectId(serviceProvider.userId);
    }

    const menus = await Menu.find(query)
      .populate("providerId", "businessName")
      .sort({ createdAt: -1 });

    let responseMenus;
    if (category) {
      responseMenus = menus
        .map((menu) => ({
          ...menu.toObject(),
          items: menu.items.filter((item: any) => item.category === category),
        }))
        .filter((menu) => menu.items.length > 0);
    } else {
      responseMenus = menus.map((menu) => menu.toObject());
    }

    return NextResponse.json({ menus: responseMenus });
  } catch (error) {
    console.error("Get menus error:", error);
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
    if (role !== "provider") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectMongoDB();
    const menuData = await request.json();

    const menu = new Menu({
      ...menuData,
      providerId: userId,
    });

    await menu.save();

    return NextResponse.json(
      { message: "Menu created successfully", menu },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create menu error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
