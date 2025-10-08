// app/api/marketing-agencies/route.js
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/auth";
import connectMongoDB from "@/libs/mongodb";
import Package from "@/Models/Packages";
import User from "@/Models/user";
import jwt from 'jsonwebtoken';

export async function GET(request) {
  try {
    await connectMongoDB();
    console.log("Fetching marketing agencies with packages");

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

    // Fetch all agencies (users with role "Marketing Agency")
    const agencies = await User.find({
      role: "Marketing Agency"
    }).select('-password');

    console.log(`Found ${agencies.length} agencies`);

    // Fetch packages for each agency and build response
    const agenciesWithPackages = [];

    for (const agency of agencies) {
      try {
        // Fetch active packages for this agency
        const packages = await Package.find({
          agency: agency._id,
          status: { $in: ['active', 'featured'] }
        }).sort({ createdAt: -1 });

        // Only include agencies that have active packages
        if (packages.length > 0) {
          // Extract unique service categories from packages
          const services = [...new Set(packages.map(pkg => pkg.category))];
          
          agenciesWithPackages.push({
            _id: agency._id,
            name: agency.firstName && agency.lastName ? `${agency.firstName} ${agency.lastName}` : agency.name,
            companyName: agency.companyDetails?.name || agency.companyName,
            email: agency.email,
            description: agency.companyDetails?.description || agency.description,
            location: agency.companyDetails?.location || agency.location,
            contact: {
              phone: agency.companyDetails?.phone || agency.phone,
              email: agency.email,
              website: agency.companyDetails?.website
            },
            rating: agency.rating || 4.5,
            reviews: agency.reviews || Math.floor(Math.random() * 100) + 20,
            services: services,
            packages: packages.map(pkg => ({
              _id: pkg._id,
              name: pkg.name,
              description: pkg.description,
              category: pkg.category,
              price: pkg.price,
              duration: pkg.duration,
              features: pkg.features || [],
              status: pkg.status,
              successRate: pkg.successRate,
              images: pkg.images || [],
              maxRevisions: pkg.maxRevisions,
              supportType: pkg.supportType,
              createdAt: pkg.createdAt,
              updatedAt: pkg.updatedAt
            }))
          });
        }
      } catch (error) {
        console.error(`Error processing agency ${agency._id}:`, error);
      }
    }

    console.log(`Returning ${agenciesWithPackages.length} agencies with packages`);

    return new Response(
      JSON.stringify({ 
        success: true,
        agencies: agenciesWithPackages 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error fetching marketing agencies:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch marketing agencies" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}