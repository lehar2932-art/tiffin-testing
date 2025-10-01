import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import Menu from "@/models/Menu";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; itemId: string } }
) {
  try {
    const userId = request.headers.get("x-user-id");
    const role = request.headers.get("x-user-role");
    if (role !== "provider") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectMongoDB();
    const updateData = await request.json();

    const menu = await Menu.findById(params.id);
    if (!menu) {
      return NextResponse.json({ error: "Menu not found" }, { status: 404 });
    }

    // Check if the menu belongs to the authenticated provider
    if (menu.providerId.toString() !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Find and update the specific item
    const itemIndex = menu.items.findIndex(
      (item: any) => item._id.toString() === params.itemId
    );
    if (itemIndex === -1) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    // Update the item
    Object.keys(updateData).forEach((key) => {
      if (key in menu.items[itemIndex]) {
        (menu.items[itemIndex] as any)[key] = updateData[key];
      }
    });

    await menu.save();

    return NextResponse.json({
      message: "Item updated successfully",
      item: menu.items[itemIndex],
    });
  } catch (error) {
    console.error("Update menu item error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
