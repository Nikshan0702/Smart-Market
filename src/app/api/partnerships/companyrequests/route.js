// pages/api/partnerships/companyrequests.js
// import { getServerSession } from "next-auth/next";
// import { authOptions } from "@/libs/authOptions";
// import connectMongoDB from "@/libs/mongodb";
// import Partnership from "@/Models/Partnership";
// import User from "@/Models/user";

// export default async function handler(req, res) {
//   const session = await getServerSession(req, res, authOptions);

//   if (!session) {
//     return res.status(401).json({ error: "Unauthorized" });
//   }

//   if (req.method !== "GET") {
//     return res.status(405).json({ error: "Method not allowed" });
//   }

//   try {
//     await connectMongoDB();

//     // Check if user is a corporate
//     const corporate = await User.findById(session.user.id);
//     if (!corporate || corporate.role !== "Corporate") {
//       return res.status(403).json({ error: "Only corporates can view partnership requests" });
//     }

//     const partnerships = await Partnership.find({ company: session.user.id })
//       .populate("dealer", "firstName lastName email companyDetails")
//       .sort({ createdAt: -1 });

//     res.status(200).json({ partnerships });
//   } catch (error) {
//     console.error("Partnership requests error:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// }

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/auth";
import connectMongoDB from "@/libs/mongodb";
import Partnership from "@/Models/Partnership";
import User from "@/Models/user";
import jwt from 'jsonwebtoken';

export async function GET(request) {
  try {
    await connectMongoDB();

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

    // Check if user is a corporate
    const corporate = await User.findById(userId);
    if (!corporate) {
      return new Response(
        JSON.stringify({ error: "User not found" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    
    if (corporate.role !== "Corporate") {
      return new Response(
        JSON.stringify({ error: "Only corporates can view partnership requests" }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const partnerships = await Partnership.find({ company: userId })
      .populate("dealer", "firstName lastName email companyDetails")
      .sort({ createdAt: -1 });

    return new Response(
      JSON.stringify({ partnerships }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Partnership requests error:", error);
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
export async function POST() {
  return new Response(
    JSON.stringify({ error: "Method not allowed" }),
    {
      status: 405,
      headers: { "Content-Type": "application/json" },
    }
  );
}