// app/api/bookings/dealer/route.js
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/auth";
import connectMongoDB from "@/libs/mongodb";
import Booking from "@/Models/Booking";
import jwt from 'jsonwebtoken';

export async function GET(request) {
  try {
    await connectMongoDB();

    // Check authentication
    let userId = null;
    const session = await getServerSession(authOptions);
    if (session?.user?.id) {
      userId = session.user.id;
    } else {
      const authHeader = request.headers.get('Authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        try {
          if (!process.env.JWT_SECRET) {
            throw new Error("JWT secret not configured");
          }
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          userId = decoded.userId || decoded.id;
        } catch (tokenError) {
          return new Response(
            JSON.stringify({ error: "Invalid or expired token" }),
            { status: 401, headers: { "Content-Type": "application/json" } }
          );
        }
      }
    }

    if (!userId) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // Get bookings for warehouses owned by this dealer
    const bookings = await Booking.find({})
      .populate({
        path: 'warehouse',
        match: { dealer: userId },
        populate: {
          path: 'dealer',
          select: 'firstName lastName companyDetails.name'
        }
      })
      .populate('corporate', 'firstName lastName companyDetails.name')
      .sort({ createdAt: -1 });

    // Filter out bookings where warehouse is null (not owned by this dealer)
    const dealerBookings = bookings.filter(booking => booking.warehouse !== null);

    return new Response(
      JSON.stringify({ 
        success: true,
        bookings: dealerBookings 
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error fetching dealer bookings:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}