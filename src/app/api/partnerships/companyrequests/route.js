// pages/api/partnerships/company-requests.js
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/authOptions";
import connectMongoDB from "@/libs/mongodb";
import Partnership from "@/Models/Partnership";
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

    // Check if user is a corporate
    const corporate = await User.findById(session.user.id);
    if (!corporate || corporate.role !== "Corporate") {
      return res.status(403).json({ error: "Only corporates can view partnership requests" });
    }

    const partnerships = await Partnership.find({ company: session.user.id })
      .populate("dealer", "firstName lastName email companyDetails")
      .sort({ createdAt: -1 });

    res.status(200).json({ partnerships });
  } catch (error) {
    console.error("Partnership requests error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}