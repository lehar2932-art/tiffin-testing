import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import Menu from "@/models/Menu";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectMongoDB();

    const menu = await Menu.findById(params.id).populate(
      "providerId",
      "businessName"
    );

    if (!menu) {
      return NextResponse.json({ error: "Menu not found" }, { status: 404 });
    }

    return NextResponse.json({ menu });
  } catch (error) {
    console.error("Get menu error:", error);
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

    const updatedMenu = await Menu.findByIdAndUpdate(params.id, updateData, {
      new: true,
    });

    return NextResponse.json({
      message: "Menu updated successfully",
      menu: updatedMenu,
    });
  } catch (error) {
    console.error("Update menu error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = request.headers.get("x-user-id");
    const role = request.headers.get("x-user-role");
    if (role !== "provider") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectMongoDB();

    const menu = await Menu.findById(params.id);
    if (!menu) {
      return NextResponse.json({ error: "Menu not found" }, { status: 404 });
    }

    // Check if the menu belongs to the authenticated provider
    if (menu.providerId.toString() !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await Menu.findByIdAndDelete(params.id);

    return NextResponse.json({ message: "Menu deleted successfully" });
  } catch (error) {
    console.error("Delete menu error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
