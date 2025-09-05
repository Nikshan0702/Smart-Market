import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/authOptions";
import connectMongoDB from "@/libs/mongodb";
import User from "@/Models/user";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    await connectMongoDB();
    const user = await User.findOne({ email: session.user.email }).select("-password");
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json(user, { status: 200 });
  } catch (e) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    await connectMongoDB();

    const { firstName, lastName, mobile, companyName } = body;
    const updatedUser = await User.findOneAndUpdate(
      { email: session.user.email },
      {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(mobile && { mobile }),
        ...(companyName && { "companyDetails.name": companyName }),
      },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (e) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 204, headers: { Allow: "GET,PUT,OPTIONS" } });
}

export async function HEAD() {
  return NextResponse.json({}, { status: 200 });
}
