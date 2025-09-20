// app/api/tenders/route.js
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/auth";
import connectMongoDB from "@/libs/mongodb";
import Tender from "@/Models/Tender";
import jwt from 'jsonwebtoken';

export async function GET(request) {
  console.log("Tender API GET request received");
  
  try {
    console.log("Connecting to MongoDB...");
    await connectMongoDB();
    console.log("MongoDB connected");
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const skip = (page - 1) * limit;

    console.log("Fetching tenders...");
    const tenders = await Tender.find({})
      .populate("dealers", "firstName lastName companyDetails")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    console.log(`Found ${tenders.length} tenders`);

    const total = await Tender.countDocuments();
    console.log(`Total tenders: ${total}`);

    return new Response(
      JSON.stringify({
        tenders,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error fetching tenders:", error);
    console.error("Error stack:", error.stack);
    
    return new Response(
      JSON.stringify({ 
        error: "Internal server error",
        details: process.env.NODE_ENV === "development" ? error.message : "Something went wrong"
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

export async function POST(request) {
  console.log("Tender API POST request received");
  
  try {
    await connectMongoDB();
    console.log("MongoDB connected");
    
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
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        
        try {
          if (!process.env.JWT_SECRET) {
            throw new Error("JWT secret not configured");
          }
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          userId = decoded.userId || decoded.id;
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
      console.log("No authentication found");
      return new Response(
        JSON.stringify({ error: "Unauthorized. Please log in." }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const body = await request.json();
    console.log("Request body:", body);

    const tender = new Tender({
      ...body,
      createdBy: userId,
      status: "active",
    });

    console.log("Saving tender...");
    await tender.save();
    console.log("Tender saved successfully");
    
    // Populate dealers for response
    console.log("Populating tender...");
    const populatedTender = await Tender.findById(tender._id)
      .populate("dealers", "firstName lastName companyDetails");

    console.log("Tender populated successfully");

    return new Response(JSON.stringify(populatedTender), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error creating tender:", error);
    console.error("Error stack:", error.stack);
    
    return new Response(
      JSON.stringify({ 
        error: "Internal server error",
        details: process.env.NODE_ENV === "development" ? error.message : "Something went wrong"
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}