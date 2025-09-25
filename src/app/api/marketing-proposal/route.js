// app/api/marketing-proposals/route.js
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/auth";
import connectMongoDB from "@/libs/mongodb";
import MarketingProposal from "@/Models/MarketingProposal";
import MarketingAgency from "@/Models/MarketingAgency";
import User from "@/Models/user";
import jwt from 'jsonwebtoken';

export async function POST(request) {
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

    const body = await request.json();
    const { agencyId, packageId, additionalRequirements, budget, timeline } = body;

    // Validate required fields
    if (!agencyId || !packageId) {
      return new Response(
        JSON.stringify({ error: "Agency ID and Package ID are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Check if agency exists
    const agency = await MarketingAgency.findById(agencyId);
    if (!agency) {
      return new Response(
        JSON.stringify({ error: "Marketing agency not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Check if package exists
    const packageExists = agency.packages.id(packageId);
    if (!packageExists) {
      return new Response(
        JSON.stringify({ error: "Package not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Check if user has already submitted a proposal for this package
    const existingProposal = await MarketingProposal.findOne({
      corporate: userId,
      agency: agencyId,
      package: packageId,
      status: { $in: ['pending', 'under_review'] }
    });

    if (existingProposal) {
      return new Response(
        JSON.stringify({ error: "You have already submitted a proposal request for this package" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Create new proposal
    const proposal = new MarketingProposal({
      corporate: userId,
      agency: agencyId,
      package: packageId,
      additionalRequirements: additionalRequirements || '',
      budget: budget || packageExists.price,
      timeline: timeline || packageExists.duration,
      status: 'pending',
      submittedAt: new Date()
    });

    await proposal.save();

    // Populate related data
    await proposal.populate('corporate', 'firstName lastName companyDetails.name');
    await proposal.populate('agency');
    await proposal.populate('package');

    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Proposal request submitted successfully",
        proposal 
      }),
      { status: 201, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error submitting proposal:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// Get corporate's proposal history
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

    const proposals = await MarketingProposal.find({ corporate: userId })
      .populate('agency')
      .populate('package')
      .sort({ submittedAt: -1 });

    return new Response(
      JSON.stringify({ 
        success: true,
        proposals 
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error fetching proposals:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}