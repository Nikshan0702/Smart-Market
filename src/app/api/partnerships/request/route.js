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
import { authOptions } from "@/libs/auth";
import connectMongoDB from "@/libs/mongodb";
import Partnership from "@/Models/Partnership";
import User from "@/Models/user";
import jwt from "jsonwebtoken";

export async function POST(request) {
  try {
    await connectMongoDB();

    const { companyId } = await request.json();
    console.log("📩 Received partnership request for company:", companyId);

    let userId = null;
    let userRole = null;

    // 🔹 Try NextAuth session first
    try {
      const session = await getServerSession(authOptions);
      if (session?.user?.id) {
        userId = session.user.id;
        userRole = session.user.role;
        console.log("✅ Authenticated via NextAuth session. User ID:", userId);
      } else {
        console.log("ℹ️ No active NextAuth session found");
      }
    } catch (sessionError) {
      console.error("⚠️ Error checking NextAuth session:", sessionError);
    }

    // 🔹 If no session, try JWT
    if (!userId) {
      const authHeader = request.headers.get("Authorization");
      console.log("Authorization header:", authHeader ? "Present" : "Missing");

      if (authHeader?.startsWith("Bearer ")) {
        const token = authHeader.substring(7);
        console.log("🔑 JWT Token received:", token ? "Yes" : "No");

        const verifiedUser = await verifyToken(token);
        if (verifiedUser) {
          userId = verifiedUser.id;
          userRole = verifiedUser.role;
          console.log("✅ Authenticated via JWT. User ID:", userId);
        } else {
          console.log("❌ Token verification failed");
        }
      }
    }

    // ❌ No valid authentication
    if (!userId) {
      console.log("❌ No valid authentication found");
      return jsonResponse({ error: "Unauthorized. Please log in." }, 401);
    }

    console.log("🔐 Authenticated user ID:", userId, "| Role:", userRole);

    // 🔹 Verify user exists in DB
    const user = await User.findById(userId);
    if (!user) {
      console.log("❌ User not found in DB for ID:", userId);
      return jsonResponse({ error: "User not found" }, 404);
    }

    if (!userRole) userRole = user.role;
    console.log("🎭 Final user role:", userRole);

    // 🔹 Only dealers can request
    if (userRole !== "Dealer") {
      console.log("❌ User is not a Dealer. Role:", userRole);
      return jsonResponse(
        { error: "Only dealers can request partnerships" },
        403
      );
    }

    // 🔹 Validate target company
    const company = await User.findById(companyId);
    if (!company) {
      console.log("❌ Company not found for ID:", companyId);
      return jsonResponse({ error: "Company not found" }, 404);
    }

    if (company.role !== "Corporate") {
      console.log("❌ Target is not Corporate. Role:", company.role);
      return jsonResponse(
        { error: "Can only request partnerships with corporate companies" },
        400
      );
    }

    // 🔹 Check if request already exists
    const existing = await Partnership.findOne({
      dealer: userId,
      company: companyId,
      status: { $in: ["pending", "accepted"] },
    });

    if (existing) {
      console.log("ℹ️ Partnership request already exists");
      return jsonResponse(
        { error: "Partnership request already exists" },
        400
      );
    }

    // 🔹 Create partnership
    const partnership = await Partnership.create({
      dealer: userId,
      company: companyId,
      status: "pending",
    });

    console.log("✅ Partnership request created successfully");

    return jsonResponse(
      {
        message: "Partnership request sent successfully",
        partnership,
      },
      201
    );
  } catch (error) {
    console.error("💥 Partnership request error:", error);
    return jsonResponse(
      {
        error: "Internal server error",
        details:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Something went wrong",
      },
      500
    );
  }
}

// 🔹 JWT verification helper
async function verifyToken(token) {
  try {
    if (!process.env.JWT_SECRET) {
      console.error("❌ JWT_SECRET not set in environment");
      return null;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("📜 Decoded JWT:", decoded);

    if (!(decoded.id || decoded.userId)) {
      console.error("❌ JWT missing user ID");
      return null;
    }

    const userId = decoded.id || decoded.userId;

    const user = await User.findById(userId);
    if (!user) {
      console.error("❌ User not found for ID from token:", decoded.id);
      return null;
    }

    return {
      id: user._id.toString(),
      role: user.role,
      email: user.email,
    };
  } catch (error) {
    console.error("⚠️ Token verification error:", error.message);
    return null;
  }
}

// 🔹 Utility response formatter
function jsonResponse(obj, status) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

// Block unsupported methods
export async function GET() {
  return jsonResponse({ error: "Method not allowed" }, 405);
}
export async function PUT() {
  return jsonResponse({ error: "Method not allowed" }, 405);
}
export async function DELETE() {
  return jsonResponse({ error: "Method not allowed" }, 405);
}

// app/api/partnerships/request/route.js
// import { getServerSession } from "next-auth/next";
// import { authOptions } from "@/libs/authOptions";
// import connectMongoDB from "@/libs/mongodb";
// import Partnership from "@/models/Partnership";
// import User from "@/models/User";

// export async function POST(request) {
//   try {
//     const session = await getServerSession(authOptions);

//     if (!session) {
//       return new Response(JSON.stringify({ error: "Unauthorized" }), {
//         status: 401,
//         headers: { "Content-Type": "application/json" },
//       });
//     }

//     await connectMongoDB();

//     const { companyId } = await request.json();

//     // Check if user is a dealer
//     const dealer = await User.findById(session.user.id);
//     if (!dealer || dealer.role !== "Dealer") {
//       return new Response(JSON.stringify({ error: "Only dealers can request partnerships" }), {
//         status: 403,
//         headers: { "Content-Type": "application/json" },
//       });
//     }

//     // Check if company exists and is a corporate
//     const company = await User.findById(companyId);
//     if (!company || company.role !== "Corporate") {
//       return new Response(JSON.stringify({ error: "Company not found" }), {
//         status: 404,
//         headers: { "Content-Type": "application/json" },
//       });
//     }

//     // Check if partnership already exists
//     const existingPartnership = await Partnership.findOne({
//       dealer: session.user.id,
//       company: companyId,
//     });

//     if (existingPartnership) {
//       return new Response(JSON.stringify({
//         error: `Partnership request already ${existingPartnership.status}`,
//         status: existingPartnership.status
//       }), {
//         status: 400,
//         headers: { "Content-Type": "application/json" },
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

//     return new Response(JSON.stringify({
//       message: "Partnership request sent successfully",
//       partnership,
//       status: "pending"
//     }), {
//       status: 201,
//       headers: { "Content-Type": "application/json" },
//     });
//   } catch (error) {
//     console.error("Partnership request error:", error);
//     return new Response(JSON.stringify({ error: "Internal server error" }), {
//       status: 500,
//       headers: { "Content-Type": "application/json" },
//     });
//   }
// }

// // Handle other HTTP methods
// export async function GET() {
//   return new Response(JSON.stringify({ error: "Method not allowed" }), {
//     status: 405,
//     headers: { "Content-Type": "application/json" },
//   });
// }

// export async function PUT() {
//   return new Response(JSON.stringify({ error: "Method not allowed" }), {
//     status: 405,
//     headers: { "Content-Type": "application/json" },
//   });
// }

// export async function DELETE() {
//   return new Response(JSON.stringify({ error: "Method not allowed" }), {
//     status: 405,
//     headers: { "Content-Type": "application/json" },
//   });
// }