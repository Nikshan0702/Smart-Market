// app/api/tenders/[id]/close/route.js
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/auth";
import connectMongoDB from "@/libs/mongodb";
import Tender from "@/Models/Tender";
import jwt from 'jsonwebtoken';

export async function PUT(request, { params }) {
  try {
    await connectMongoDB();
    
    const { id } = await params;
    
    let userId = null;
    
    // Check authentication
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
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const tender = await Tender.findById(id);
    
    if (!tender) {
      return new Response(
        JSON.stringify({ error: "Tender not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }
    
    // Check if user owns this tender
    if (tender.createdBy.toString() !== userId) {
      return new Response(
        JSON.stringify({ error: "Not authorized to close this tender" }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }
    
    tender.status = "closed";
    await tender.save();
    
    const populatedTender = await Tender.findById(tender._id)
      .populate("dealers", "firstName lastName companyDetails")
      .populate({
        path: "quotes",
        populate: {
          path: "dealer",
          select: "firstName lastName email companyDetails"
        }
      });
    
    return new Response(JSON.stringify(populatedTender), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error closing tender:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}