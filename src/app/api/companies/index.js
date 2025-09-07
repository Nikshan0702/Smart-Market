// pages/api/companies/index.js
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/authOptions";
import connectMongoDB from "@/libs/mongodb";
import User from "@/Models/user";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    await connectMongoDB();

    const { page = 1, limit = 10, search } = req.query;
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
      .select("firstName lastName email companyDetails")
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ "companyDetails.name": 1 });

    const total = await User.countDocuments(query);

    res.status(200).json({
      companies,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total,
    });
  } catch (error) {
    console.error("Companies fetch error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}