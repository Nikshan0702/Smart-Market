// app/api/warehouses/check-availability/route.js
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/auth";
import connectMongoDB from "@/libs/mongodb";
import Warehouse from "@/Models/Warehouse";
import Booking from "@/Models/Booking";
import jwt from 'jsonwebtoken';

export async function POST(request) {
  try {
    await connectMongoDB();
    const body = await request.json();
    const { warehouseId, startDate, endDate, requiredArea } = body;

    console.log("Availability check:", { warehouseId, startDate, endDate, requiredArea });

    // Check if warehouse exists and has enough space
    const warehouse = await Warehouse.findById(warehouseId);
    if (!warehouse) {
      return new Response(
        JSON.stringify({ available: false, reason: "Warehouse not found" }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    if (warehouse.availableArea < requiredArea) {
      return new Response(
        JSON.stringify({ 
          available: false, 
          reason: "Insufficient available space",
          availableArea: warehouse.availableArea,
          requestedArea: requiredArea
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // Check for overlapping bookings
    const overlappingBookings = await Booking.find({
      warehouse: warehouseId,
      status: { $in: ['pending', 'confirmed'] },
      $or: [
        { startDate: { $lte: new Date(endDate) }, endDate: { $gte: new Date(startDate) } }
      ]
    });

    // Calculate already booked area during requested period
    const bookedArea = overlappingBookings.reduce((total, booking) => {
      return total + booking.requiredArea;
    }, 0);

    const available = (warehouse.availableArea - bookedArea) >= requiredArea;

    console.log("Availability result:", {
      available,
      warehouseArea: warehouse.availableArea,
      bookedArea,
      remainingArea: warehouse.availableArea - bookedArea,
      requestedArea: requiredArea
    });

    return new Response(
      JSON.stringify({ 
        available,
        availableArea: warehouse.availableArea - bookedArea,
        requestedArea: requiredArea
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error checking availability:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}