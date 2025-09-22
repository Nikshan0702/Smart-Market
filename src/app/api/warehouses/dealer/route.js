// app/api/warehouses/dealer/route.js
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/auth";
import connectMongoDB from "@/libs/mongodb";
import Warehouse from "@/Models/Warehouse";
import User from "@/Models/user";
import jwt from 'jsonwebtoken';

export async function GET(request) {
  try {
    await connectMongoDB();
    console.log("Fetching dealer warehouses");

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
          // Verify token
          if (!process.env.JWT_SECRET) {
            throw new Error("JWT secret not configured");
          }
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          console.log("Decoded token:", decoded);
          
          // Handle both userId and id fields in the token
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

    // Check if user is a dealer
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

    if (user.role !== "Dealer") {
      console.log("User is not a dealer. Role:", user.role);
      return new Response(
        JSON.stringify({ error: "Only dealers can manage warehouses" }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Fetch warehouses for the dealer
    const warehouses = await Warehouse.find({ dealer: userId })
      .sort({ createdAt: -1 });

    console.log(`Found ${warehouses.length} warehouses for dealer ${userId}`);

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
    console.error("Error fetching warehouses:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}