// app/api/bookings/[id]/route.js
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/auth";
import connectMongoDB from "@/libs/mongodb";
import Booking from "@/Models/Booking";
import jwt from 'jsonwebtoken';

export async function PUT(request, { params }) {
  try {
    await connectMongoDB();
    const { id } = params;
    const body = await request.json();
    const { action, dealerNotes } = body;

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

    // Find booking and check if dealer owns the warehouse
    const booking = await Booking.findById(id).populate('warehouse');
    if (!booking) {
      return new Response(
        JSON.stringify({ error: "Booking not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    if (booking.warehouse.dealer.toString() !== userId) {
      return new Response(
        JSON.stringify({ error: "Unauthorized to modify this booking" }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }

    // Validate action
    const validActions = ['confirm', 'reject', 'complete', 'cancel'];
    if (!validActions.includes(action)) {
      return new Response(
        JSON.stringify({ error: "Invalid action" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Update booking
    booking.status = action === 'confirm' ? 'confirmed' : 
                    action === 'reject' ? 'rejected' :
                    action === 'complete' ? 'completed' : 'cancelled';
    
    if (dealerNotes) {
      booking.dealerNotes = dealerNotes;
    }

    booking.updatedAt = new Date();
    await booking.save();

    await booking.populate('corporate', 'firstName lastName companyDetails.name');
    await booking.populate('warehouse');

    return new Response(
      JSON.stringify({ 
        success: true,
        message: `Booking ${action}ed successfully`,
        booking 
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error updating booking:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}