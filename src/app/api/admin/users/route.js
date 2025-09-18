import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/authOptions";
import connectMongoDB from "@/libs/mongodb";
import User from "@/Models/user";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    // if (!session) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }
    
    // // Check if user is an admin
    // if (session.user.role !== "Admin") {
    //   return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    // }
    
    await connectMongoDB();
    
    // Get all users excluding password field
    const users = await User.find({}).select("-password");
    
    return NextResponse.json({ users }, { status: 200 });
  } catch (e) {
    console.error("Admin users fetch error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 204, headers: { Allow: "GET,OPTIONS" } });
}