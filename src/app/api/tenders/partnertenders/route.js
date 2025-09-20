import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/auth";
import connectMongoDB from "@/libs/mongodb";
import Tender from "@/Models/Tender";
import Partnership from "@/Models/Partnership";
import User from "@/Models/user";
import jwt from 'jsonwebtoken';

export async function GET(request) {
  try {
    await connectMongoDB();

    // Check authentication via both methods
    let userId = null;
    let userRole = null;
    
    // First try NextAuth session
    const session = await getServerSession(authOptions);
    if (session?.user?.id) {
      userId = session.user.id;
      userRole = session.user.role;
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
          userRole = decoded.role;
          
          if (!userId) {
            return new Response(
              JSON.stringify({ error: "Invalid token format" }),
              {
                status: 401,
                headers: { "Content-Type": "application/json" },
              }
            );
          }
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

    // Check if user is a dealer
    const user = await User.findById(userId);
    if (!user || user.role !== "Dealer") {
      return new Response(
        JSON.stringify({ error: "Only dealers can view partner tenders" }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Get accepted partnerships for this dealer
    const partnerships = await Partnership.find({
      dealer: userId,
      status: "approved"
    });

    const partnerCompanyIds = partnerships.map(p => p.company);

    // Get active tenders from partner companies
    const tenders = await Tender.find({
      createdBy: { $in: partnerCompanyIds },
      status: "active"
    })
    .populate("createdBy", "companyDetails.name")
    .sort({ createdAt: -1 });

    return new Response(
      JSON.stringify({ tenders }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error fetching partner tenders:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}