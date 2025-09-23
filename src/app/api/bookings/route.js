// app/api/bookings/route.js
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/auth";
import connectMongoDB from "@/libs/mongodb";
import Booking from "@/Models/Booking";
import Warehouse from "@/Models/Warehouse";
import User from "@/Models/user";
import jwt from 'jsonwebtoken';

export async function POST(request) {
  try {
    await connectMongoDB();
    console.log("Booking creation request received");

    // Check authentication via both methods
    let userId = null;
    
    // First try NextAuth session
    const session = await getServerSession(authOptions);
    if (session?.user?.id) {
      userId = session.user.id;
      console.log("Authenticated via NextAuth session. User ID:", userId);
    } 
    // If no session, check for token in headers (custom auth)
    else {
      const authHeader = request.headers.get('Authorization');
      console.log("Auth header:", authHeader);
      
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        
        try {
          if (!process.env.JWT_SECRET) {
            throw new Error("JWT secret not configured");
          }
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          console.log("Decoded token:", decoded);
          
          userId = decoded.userId || decoded.id;
          
          if (!userId) {
            console.error("Token does not contain user ID");
            return new Response(
              JSON.stringify({ error: "Invalid token format" }),
              {
                status: 401,
                headers: { "Content-Type": "application/json" },
              }
            );
          }
          console.log("Authenticated via JWT token. User ID:", userId);
        } catch (tokenError) {
          console.error("Token verification error:", tokenError);
          return new Response(
            JSON.stringify({ error: "Invalid or expired token" }),
            {
              status: 401,
              headers: { "Content-Type": "application/json" },
            }
          );
        }
      }
    }

    if (!userId) {
      console.log("No valid authentication found");
      return new Response(
        JSON.stringify({ error: "Unauthorized. Please log in." }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Check if user is a corporate
    const user = await User.findById(userId);
    if (!user) {
      console.log("User not found for ID:", userId);
      return new Response(
        JSON.stringify({ error: "User not found" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (user.role !== "Corporate") {
      console.log("User is not a corporate. Role:", user.role);
      return new Response(
        JSON.stringify({ error: "Only corporate users can create bookings" }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const body = await request.json();
    const { warehouse, startDate, endDate, requiredArea, totalPrice, specialRequirements } = body;

    console.log("Booking data received:", {
      warehouse,
      startDate,
      endDate,
      requiredArea,
      totalPrice,
      specialRequirements
    });

    // Validate required fields
    if (!warehouse || !startDate || !endDate || !requiredArea || !totalPrice) {
      console.log("Missing required fields");
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Check if warehouse exists
    const warehouseDoc = await Warehouse.findById(warehouse);
    if (!warehouseDoc) {
      console.log("Warehouse not found:", warehouse);
      return new Response(
        JSON.stringify({ error: "Warehouse not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (start < today) {
      return new Response(
        JSON.stringify({ error: "Start date cannot be in the past" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (end <= start) {
      return new Response(
        JSON.stringify({ error: "End date must be after start date" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Validate area
    const area = parseInt(requiredArea);
    if (area < 1) {
      return new Response(
        JSON.stringify({ error: "Required area must be at least 1 sqft" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (area > warehouseDoc.availableArea) {
      return new Response(
        JSON.stringify({ error: "Required area exceeds available space" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Check for overlapping bookings
    const overlappingBookings = await Booking.find({
      warehouse: warehouse,
      status: { $in: ['pending', 'confirmed'] },
      $or: [
        { startDate: { $lte: end }, endDate: { $gte: start } }
      ]
    });

    const bookedArea = overlappingBookings.reduce((total, booking) => {
      return total + booking.requiredArea;
    }, 0);

    const availableArea = warehouseDoc.availableArea - bookedArea;
    if (area > availableArea) {
      return new Response(
        JSON.stringify({ 
          error: "Not enough available space for the selected dates",
          availableArea,
          requestedArea: area
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Create booking
    const booking = new Booking({
      warehouse,
      corporate: userId, // Use the authenticated user's ID
      startDate: start,
      endDate: end,
      requiredArea: area,
      totalPrice: parseFloat(totalPrice),
      specialRequirements: specialRequirements || '',
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await booking.save();
    console.log("Booking created successfully:", booking._id);

    // Populate related data for response
    await booking.populate('warehouse');
    await booking.populate('corporate', 'firstName lastName companyDetails.name');
    await booking.populate('warehouse.dealer', 'firstName lastName companyDetails.name');

    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Booking request created successfully",
        booking 
      }),
      { status: 201, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error creating booking:", error);
    return new Response(
      JSON.stringify({ 
        error: "Internal server error",
        details: error.message 
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// GET endpoint to fetch corporate's bookings
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

    const bookings = await Booking.find({ corporate: userId })
      .populate('warehouse')
      .populate('corporate', 'firstName lastName companyDetails.name')
      .sort({ createdAt: -1 });

    return new Response(
      JSON.stringify({ 
        success: true,
        bookings 
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}