// // pages/api/companies/route.js
// import { getServerSession } from "next-auth/next";
// import { authOptions } from "@/libs/authOptions";
// import connectMongoDB from "@/libs/mongodb";
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

//     const { page = 1, limit = 10, search } = req.query;
//     const skip = (page - 1) * limit;

//     let query = { role: "Corporate", status: "active" };

//     if (search) {
//       query.$or = [
//         { "companyDetails.name": { $regex: search, $options: "i" } },
//         { "companyDetails.industryType": { $regex: search, $options: "i" } },
//         { firstName: { $regex: search, $options: "i" } },
//         { lastName: { $regex: search, $options: "i" } },
//       ];
//     }

//     const companies = await User.find(query)
//       .select("firstName lastName email companyDetails")
//       .skip(skip)
//       .limit(parseInt(limit))
//       .sort({ "companyDetails.name": 1 });

//     const total = await User.countDocuments(query);

//     res.status(200).json({
//       companies,
//       totalPages: Math.ceil(total / limit),
//       currentPage: parseInt(page),
//       total,
//     });
//   } catch (error) {
//     console.error("Companies fetch error:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// }

// import { getServerSession } from "next-auth/next";
// import { authOptions } from "@/libs/authOptions";
// import connectMongoDB from "@/libs/mongodb";
// import User from "@/Models/user";
// import { NextResponse } from "next/server";

// export async function GET(request) {
//   const session = await getServerSession(authOptions);

//   if (!session) {
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//   }

//   try {
//     await connectMongoDB();

//     const { searchParams } = new URL(request.url);
//     const page = searchParams.get("page") || 1;
//     const limit = searchParams.get("limit") || 10;
//     const search = searchParams.get("search");
    
//     const skip = (page - 1) * limit;

//     let query = { role: "Corporate", status: "active" };

//     if (search) {
//       query.$or = [
//         { "companyDetails.name": { $regex: search, $options: "i" } },
//         { "companyDetails.industryType": { $regex: search, $options: "i" } },
//         { firstName: { $regex: search, $options: "i" } },
//         { lastName: { $regex: search, $options: "i" } },
//       ];
//     }

//     const companies = await User.find(query)
//       .select("firstName lastName email companyDetails")
//       .skip(skip)
//       .limit(parseInt(limit))
//       .sort({ "companyDetails.name": 1 });

//     const total = await User.countDocuments(query);

//     return NextResponse.json({
//       companies,
//       totalPages: Math.ceil(total / limit),
//       currentPage: parseInt(page),
//       total,
//     });
//   } catch (error) {
//     console.error("Companies fetch error:", error);
//     return NextResponse.json(
//       { error: "Internal server error" },
//       { status: 500 }
//     );
//   }
// }

// app/api/companies/route.js
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/auth";
import connectMongoDB from "@/libs/mongodb";
import User from "@/Models/user";
import Partnership from "@/Models/Partnership";

export async function GET(request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    await connectMongoDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const search = searchParams.get("search");
    const skip = (page - 1) * limit;

    let query = { role: "Corporate", status: "active" };

    if (search) {
      query.$or = [
        { "companyDetails.name": { $regex: search, $options: "i" } },
        { "companyDetails.industryType": { $regex: search, $options: "i" } },
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
      ];
    }

    const companies = await User.find(query)
      .select("firstName lastName email companyDetails role")
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ "companyDetails.name": 1 });

    // Check if current user has pending partnership requests with each company
    const companiesWithPartnershipStatus = await Promise.all(
      companies.map(async (company) => {
        const partnership = await Partnership.findOne({
          dealer: session.user.id,
          company: company._id,
          status: "pending",
        });
        
        return {
          ...company.toObject(),
          hasPartnershipRequest: !!partnership,
        };
      })
    );

    const total = await User.countDocuments(query);

    return new Response(
      JSON.stringify({
        companies: companiesWithPartnershipStatus,
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        total,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Companies fetch error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}