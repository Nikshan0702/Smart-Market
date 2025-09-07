// pages/api/partnerships/update-status.js
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

  if (req.method !== "PUT") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    await connectMongoDB();

    const { partnershipId, status, notes } = req.body;

    // Check if user is a corporate
    const corporate = await User.findById(session.user.id);
    if (!corporate || corporate.role !== "Corporate") {
      return res.status(403).json({ error: "Only corporates can update partnership status" });
    }

    const partnership = await Partnership.findById(partnershipId).populate(
      "company",
      "_id"
    );

    if (!partnership) {
      return res.status(404).json({ error: "Partnership not found" });
    }

    // Check if the corporate owns this partnership
    if (partnership.company._id.toString() !== session.user.id) {
      return res.status(403).json({ error: "Not authorized to update this partnership" });
    }

    partnership.status = status;
    partnership.reviewedAt = new Date();
    if (notes) partnership.notes = notes;

    await partnership.save();

    await partnership.populate("dealer", "firstName lastName email companyDetails");
    await partnership.populate("company", "firstName lastName email companyDetails");

    res.status(200).json({
      message: `Partnership ${status} successfully`,
      partnership,
    });
  } catch (error) {
    console.error("Partnership update error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}