// app/api/marketing-agencies/contact/route.js
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/auth";
import connectMongoDB from "@/libs/mongodb";
import ContactInquiry from "@/Models/ContactInquiry";
import User from "@/Models/user";
import jwt from 'jsonwebtoken';

export async function POST(request) {
  try {
    await connectMongoDB();
    console.log("Agency contact request received");

    // Check authentication via both methods
    let userId = null;
    
    const session = await getServerSession(authOptions);
    if (session?.user?.id) {
      userId = session.user.id;
      console.log("Authenticated via NextAuth session. User ID:", userId);
    } else {
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

    // Parse request body
    const body = await request.json();
    const {
      agencyId,
      agencyName,
      message,
      inquiryType = 'general'
    } = body;

    console.log("Contact inquiry data received:", {
      agencyId,
      agencyName,
      inquiryType
    });

    // Validate required fields
    if (!agencyId) {
      console.log("Missing agency ID");
      return new Response(
        JSON.stringify({ error: "Agency ID is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Verify agency exists
    const agency = await User.findById(agencyId);
    if (!agency) {
      console.log("Agency not found for ID:", agencyId);
      return new Response(
        JSON.stringify({ error: "Agency not found" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Get client user info
    const client = await User.findById(userId);
    if (!client) {
      console.log("Client not found for ID:", userId);
      return new Response(
        JSON.stringify({ error: "Client not found" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Create contact inquiry
    const inquiry = new ContactInquiry({
      client: userId,
      agency: agencyId,
      inquiryType,
      message: message || 'I am interested in your marketing services and would like to learn more about your packages.',
      status: 'new',
      submittedAt: new Date()
    });

    await inquiry.save();
    console.log("Contact inquiry created successfully:", inquiry._id);

    // TODO: Send notification to agency (email, in-app notification, etc.)

    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Contact request sent successfully",
        inquiry: {
          _id: inquiry._id,
          status: inquiry.status,
          submittedAt: inquiry.submittedAt
        }
      }),
      {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error creating contact inquiry:", error);
    return new Response(
      JSON.stringify({ error: "Failed to send contact request" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}