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

// app/api/partnerships/request/route.js
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/authOptions";
import connectMongoDB from "@/libs/mongodb";
import Partnership from "@/Models/Partnership";
import User from "@/Models/user";

export async function POST(request) {
  // const session = await getServerSession(authOptions);

  // if (!session || !session.user || !session.user.id) {
  //   return new Response(
  //     JSON.stringify({ error: "Unauthorized" }),
  //     {
  //       status: 401,
  //       headers: { "Content-Type": "application/json" },
  //     }
  //   );
  // }

  try {
    await connectMongoDB();

    const body = await request.json();
    const { companyId } = body;

    // Check if user exists and get their role
    const user = await User.findById(session.user.id);
    if (!user) {
      return new Response(
        JSON.stringify({ error: "User not found" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Check if user is a dealer
    if (user.role !== "Dealer") {
      return new Response(
        JSON.stringify({ error: "Only dealers can request partnerships" }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Check if company exists
    const company = await User.findById(companyId);
    if (!company || company.role !== "Corporate") {
      return new Response(
        JSON.stringify({ error: "Company not found" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Check if partnership request already exists
    const existingPartnership = await Partnership.findOne({
      dealer: session.user.id,
      company: companyId,
      status: { $in: ["pending", "accepted"] },
    });

    if (existingPartnership) {
      return new Response(
        JSON.stringify({ error: "Partnership request already exists" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Create new partnership request
    const partnership = new Partnership({
      dealer: session.user.id,
      company: companyId,
      status: "pending",
    });

    await partnership.save();

    return new Response(
      JSON.stringify({ message: "Partnership request sent successfully" }),
      {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Partnership request error:", error);
    return new Response(
      JSON.stringify({ 
        error: "Internal server error",
        details: process.env.NODE_ENV === "development" ? error.message : "Something went wrong"
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
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