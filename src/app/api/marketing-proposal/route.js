// app/api/marketing-proposals/route.js
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/auth";
import connectMongoDB from "@/libs/mongodb";
import Proposal from "@/Models/Proposal";
import User from "@/Models/user";
import Package from "@/Models/Packages";
import jwt from 'jsonwebtoken';

export async function POST(request) {
  try {
    await connectMongoDB();
    console.log("Marketing proposal request received");

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
      packageId,
      packageName,
      additionalRequirements,
      budget,
      timeline,
      category
    } = body;

    console.log("Proposal data received:", {
      agencyId,
      packageId,
      packageName,
      budget,
      timeline,
      category
    });

    // Validate required fields
    if (!agencyId || !packageId) {
      console.log("Missing required fields");
      return new Response(
        JSON.stringify({ error: "Agency ID and Package ID are required" }),
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

    // Verify package exists and belongs to agency
    const packages = await Package.findOne({
      _id: packageId,
      agency: agencyId
    });

    if (!packages) {
      console.log("Package not found or doesn't belong to agency");
      return new Response(
        JSON.stringify({ error: "Package not found or doesn't belong to the agency" }),
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

    // Create proposal
    const proposal = new Proposal({
      client: userId,
      agency: agencyId,
      package: packageId,
      packageName: packageName || packages.name,
      category: category || packages.category,
      budget: budget || packages.price,
      timeline: timeline || packages.duration,
      additionalRequirements: additionalRequirements || '',
      status: 'pending',
      submittedAt: new Date()
    });

    await proposal.save();
    console.log("Proposal created successfully:", proposal._id);

    // TODO: Send notification to agency (email, in-app notification, etc.)

    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Proposal request submitted successfully",
        proposal: {
          _id: proposal._id,
          status: proposal.status,
          submittedAt: proposal.submittedAt
        }
      }),
      {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error creating marketing proposal:", error);
    return new Response(
      JSON.stringify({ error: "Failed to submit proposal request" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}