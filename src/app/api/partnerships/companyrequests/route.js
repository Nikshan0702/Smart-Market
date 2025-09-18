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
import { authOptions } from "@/libs/authOptions";
import connectMongoDB from "@/libs/mongodb";
import Partnership from "@/Models/Partnership";
import User from "@/Models/user";

// Handle GET requests
export async function GET(request) {
  // const session = await getServerSession(authOptions);

  // if (!session) {
  //   return new Response(JSON.stringify({ error: "Unauthorized" }), {
  //     status: 401,
  //     headers: { "Content-Type": "application/json" },
  //   });
  // }

  try {
    await connectMongoDB();

    // Check if user is a corporate
    const corporate = await User.findById(session.user.id);
    if (!corporate || corporate.role !== "Corporate") {
      return new Response(JSON.stringify({ error: "Only corporates can view partnership requests" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    const partnerships = await Partnership.find({ company: session.user.id })
      .populate("dealer", "firstName lastName email companyDetails")
      .sort({ createdAt: -1 });

    return new Response(JSON.stringify({ partnerships }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Partnership requests error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// Handle other HTTP methods
export async function POST() {
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