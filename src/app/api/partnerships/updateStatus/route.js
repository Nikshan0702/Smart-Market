// pages/api/partnerships/update-status.js
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/auth";
import connectMongoDB from "@/libs/mongodb";
import Partnership from "@/Models/Partnership";
import User from "@/Models/user";
import jwt from 'jsonwebtoken';

export async function PUT(request) {
  try {
    await connectMongoDB();

    const body = await request.json();
    const { partnershipId, status, notes } = body;

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
          // Verify token
          if (!process.env.JWT_SECRET) {
            throw new Error("JWT secret not configured");
          }
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          
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
      return new Response(
        JSON.stringify({ error: "Unauthorized. Please log in." }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Check if user is a corporate
    const corporate = await User.findById(userId);
    if (!corporate || corporate.role !== "Corporate") {
      return new Response(
        JSON.stringify({ error: "Only corporates can update partnership status" }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const partnership = await Partnership.findById(partnershipId).populate(
      "company",
      "_id"
    );

    if (!partnership) {
      return new Response(
        JSON.stringify({ error: "Partnership not found" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Check if the corporate owns this partnership
    if (partnership.company._id.toString() !== userId) {
      return new Response(
        JSON.stringify({ error: "Not authorized to update this partnership" }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    partnership.status = status;
    partnership.reviewedAt = new Date();
    if (notes) partnership.notes = notes;

    await partnership.save();

    await partnership.populate("dealer", "firstName lastName email companyDetails");
    await partnership.populate("company", "firstName lastName email companyDetails");

    return new Response(
      JSON.stringify({
        message: `Partnership ${status} successfully`,
        partnership,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Partnership update error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

// Handle other HTTP methods
export async function GET() {
  return new Response(
    JSON.stringify({ error: "Method not allowed" }),
    {
      status: 405,
      headers: { "Content-Type": "application/json" },
    }
  );
}