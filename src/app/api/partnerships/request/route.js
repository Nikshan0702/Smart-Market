// // pages/api/partnerships/request.js
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

//   if (req.method !== "POST") {
//     return res.status(405).json({ error: "Method not allowed" });
//   }

//   try {
//     await connectMongoDB();

//     const { companyId } = req.body;

//     // Check if user is a dealer
//     const dealer = await User.findById(session.user.id);
//     if (!dealer || dealer.role !== "Dealer") {
//       return res.status(403).json({ error: "Only dealers can request partnerships" });
//     }

//     // Check if company exists and is a corporate
//     const company = await User.findById(companyId);
//     if (!company || company.role !== "Corporate") {
//       return res.status(404).json({ error: "Company not found" });
//     }

//     // Check if partnership already exists
//     const existingPartnership = await Partnership.findOne({
//       dealer: session.user.id,
//       company: companyId,
//     });

//     if (existingPartnership) {
//       return res.status(400).json({
//         error: `Partnership request already ${existingPartnership.status}`,
//       });
//     }

//     // Create new partnership request
//     const partnership = new Partnership({
//       dealer: session.user.id,
//       company: companyId,
//       status: "pending",
//     });

//     await partnership.save();

//     // Populate the response with company details
//     await partnership.populate("company", "firstName lastName email companyDetails");

//     res.status(201).json({
//       message: "Partnership request sent successfully",
//       partnership,
//     });
//   } catch (error) {
//     console.error("Partnership request error:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// }

// src/app/api/partnerships/request/route.js
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/authOptions";
import connectMongoDB from "@/libs/mongodb";
import Partnership from "@/Models/Partnership";
import User from "@/Models/user";

// Handle POST requests
export async function POST(request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    await connectMongoDB();

    const { companyId } = await request.json();

    // Check if user is a dealer
    const dealer = await User.findById(session.user.id);
    if (!dealer || dealer.role !== "Dealer") {
      return new Response(JSON.stringify({ error: "Only dealers can request partnerships" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Check if company exists and is a corporate
    const company = await User.findById(companyId);
    if (!company || company.role !== "Corporate") {
      return new Response(JSON.stringify({ error: "Company not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Check if partnership already exists
    const existingPartnership = await Partnership.findOne({
      dealer: session.user.id,
      company: companyId,
    });

    if (existingPartnership) {
      return new Response(JSON.stringify({
        error: `Partnership request already ${existingPartnership.status}`,
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Create new partnership request
    const partnership = new Partnership({
      dealer: session.user.id,
      company: companyId,
      status: "pending",
    });

    await partnership.save();

    // Populate the response with company details
    await partnership.populate("company", "firstName lastName email companyDetails");

    return new Response(JSON.stringify({
      message: "Partnership request sent successfully",
      partnership,
    }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Partnership request error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// Handle other HTTP methods
export async function GET() {
  return new Response(JSON.stringify({ error: "Method not allowed" }), {
    status: 405,
    headers: { "Content-Type": "application/json" },
  });
}

export async function PUT() {
  return new Response(JSON.stringify({ error: "Method not allowed" }), {
    status: 405,
    headers: { "Content-Type": "application/json" },
  });
}

export async function DELETE() {
  return new Response(JSON.stringify({ error: "Method not allowed" }), {
    status: 405,
    headers: { "Content-Type": "application/json" },
  });
}