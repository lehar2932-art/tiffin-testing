import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import User from "@/models/User";
import ServiceProvider from "@/models/ServiceProvider";
import { hashPassword, generateToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    await connectMongoDB();
    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(data.password);

    const user = new User({
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: data.role,
      phone: data.phone,
      address: data.address,
      tokenVersion: 0,
    });

    await user.save();

    if (data.role === "provider" && data.businessData) {
      const serviceProvider = new ServiceProvider({
        userId: user._id,
        businessName: data.businessData.businessName,
        description: data.businessData.description,
        cuisine: data.businessData.cuisine || [],
        deliveryAreas: data.businessData.deliveryAreas || [],
        operatingHours: data.businessData.operatingHours || {
          start: "09:00",
          end: "21:00",
        },
      });

      await serviceProvider.save();
    }
    const token = await generateToken({
      userId: user._id,
      email: user.email,
      role: user.role,
      tokenVersion: user.tokenVersion,
    });

    const response = NextResponse.json(
      {
        message: "User registered successfully",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      { status: 201 }
    );

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
