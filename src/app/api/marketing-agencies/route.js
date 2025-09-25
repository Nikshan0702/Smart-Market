// app/api/marketing-agencies/route.js
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/auth";
import connectMongoDB from "@/libs/mongodb";
import User from "@/Models/user";
import MarketingAgency from "@/Models/MarketingAgency";
import Partnership from "@/Models/Partnership";
import jwt from 'jsonwebtoken';

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

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const search = searchParams.get("search") || "";
    const serviceType = searchParams.get("serviceType") || ""; // tv, social, creative
    const minRating = parseFloat(searchParams.get("minRating")) || 0;
    const skip = (page - 1) * limit;

    // Build query
    let query = { status: 'approved',role: 'Marketing Agency' };

    // Search filter
    if (search) {
      query.$or = [
        { "companyName": { $regex: search, $options: "i" } },
        { "services.description": { $regex: search, $options: "i" } },
        { "specializations": { $regex: search, $options: "i" } }
      ];
    }

    // Service type filter
    if (serviceType) {
      query["services.type"] = serviceType;
    }

    // Rating filter
    if (minRating > 0) {
      query.rating = { $gte: minRating };
    }

    // Get marketing agencies with pagination
    const agencies = await User.find(query)
      .populate('user', 'firstName lastName email mobile companyDetails')
      .skip(skip)
      .limit(limit)
      .sort({ rating: -1, createdAt: -1 });

    // Check partnership status for each agency
    const agenciesWithPartnershipStatus = await Promise.all(
      agencies.map(async (agency) => {
        const partnership = await Partnership.findOne({
          $or: [
            { corporate: userId, marketingAgency: agency._id },
            { corporate: userId, company: agency.user?._id }
          ],
          status: { $in: ["pending", "approved"] }
        });

        return {
          ...agency.toObject(),
          hasPartnershipRequest: !!partnership,
          partnershipStatus: partnership?.status || null,
          partnershipId: partnership?._id || null
        };
      })
    );

    // Get total count for pagination
    const total = await User.countDocuments(query);

    return new Response(
      JSON.stringify({ 
        success: true,
        agencies: agenciesWithPartnershipStatus,
        pagination: {
          totalPages: Math.ceil(total / limit),
          currentPage: page,
          total,
          hasNextPage: page < Math.ceil(total / limit),
          hasPrevPage: page > 1
        }
      }),
      { 
        status: 200, 
        headers: { "Content-Type": "application/json" } 
      }
    );
  } catch (error) {
    console.error("Error fetching marketing agencies:", error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || "Internal server error" 
      }),
      { 
        status: 500, 
        headers: { "Content-Type": "application/json" } 
      }
    );
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    await connectMongoDB();

    const body = await request.json();
    const {
      companyName,
      description,
      services,
      packages,
      specializations,
      contactInfo,
      socialMediaLinks,
      portfolio
    } = body;

    // Validate required fields
    if (!companyName || !description || !services || !packages) {
      return new Response(
        JSON.stringify({ error: "Company name, description, services, and packages are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Check if user already has a marketing agency profile
    const existingAgency = await MarketingAgency.findOne({ user: session.user.id });
    if (existingAgency) {
      return new Response(
        JSON.stringify({ error: "Marketing agency profile already exists for this user" }),
        { status: 409, headers: { "Content-Type": "application/json" } }
      );
    }

    // Check if user has the correct role
    const user = await User.findById(session.user.id);
    if (user.role !== 'MarketingAgency') {
      return new Response(
        JSON.stringify({ error: "Only users with MarketingAgency role can create agency profiles" }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }

    // Create new marketing agency
    const newAgency = new MarketingAgency({
      user: session.user.id,
      companyName,
      description,
      services: services.map(service => ({
        type: service.type, // tv, social, creative
        name: service.name,
        description: service.description,
        packages: service.packages || []
      })),
      packages: packages.map(pkg => ({
        name: pkg.name,
        type: pkg.type,
        price: pkg.price,
        duration: pkg.duration,
        features: pkg.features,
        description: pkg.description
      })),
      specializations: specializations || [],
      contactInfo: contactInfo || {},
      socialMediaLinks: socialMediaLinks || {},
      portfolio: portfolio || [],
      status: 'pending',
      rating: 0,
      reviews: []
    });

    await newAgency.save();

    // Populate user data in response
    await newAgency.populate('user', 'firstName lastName email mobile companyDetails');

    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Marketing agency profile created successfully",
        agency: newAgency 
      }),
      { 
        status: 201, 
        headers: { "Content-Type": "application/json" } 
      }
    );
  } catch (error) {
    console.error("Error creating marketing agency:", error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || "Internal server error" 
      }),
      { 
        status: 500, 
        headers: { "Content-Type": "application/json" } 
      }
    );
  }
}