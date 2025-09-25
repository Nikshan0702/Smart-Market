// app/api/warehouses/available/route.js
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/auth";
import connectMongoDB from "@/libs/mongodb";
import Warehouse from "@/Models/Warehouse";

export async function GET(request) {
  try {
    await connectMongoDB();

    // Get active warehouses with available space
    const warehouses = await Warehouse.find({
      status: 'active',
      availableArea: { $gt: 0 }
    })
    .populate('dealer', 'firstName lastName companyDetails.name')
    .sort({ createdAt: -1 });

    return new Response(
      JSON.stringify({ 
        success: true,
        warehouses 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error fetching available warehouses:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}