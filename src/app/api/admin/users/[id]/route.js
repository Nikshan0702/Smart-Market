import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/authOptions";
import connectMongoDB from "@/libs/mongodb";
import User from "@/Models/user";

export async function PUT(request, { params }) {
  try {
    // const session = await getServerSession(authOptions);
    
    // if (!session) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }
    
    // if (session.user.role !== "Admin") {
    //   return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    // }
    
    const { id } = params;
    const { status } = await request.json();
    
    await connectMongoDB();
    
    // Validate status value
    const validStatuses = ["pending", "active", "rejected", "pending_verification"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status value" },
        { status: 400 }
      );
    }
    
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).select("-password");
    
    if (!updatedUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { message: "User status updated successfully", user: updatedUser },
      { status: 200 }
    );
  } catch (e) {
    console.error("Admin user update error:", e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}