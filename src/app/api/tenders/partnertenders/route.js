// app/api/tenders/partnertenders/route.js
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/auth";
import connectMongoDB from "@/libs/mongodb";
import Tender from "@/Models/Tender";
import TenderQuote from "@/Models/TenderQuote";
import Partnership from "@/Models/Partnership";
import jwt from 'jsonwebtoken';

export async function GET(request) {
  try {
    await connectMongoDB();

    // Authentication (same as your quote endpoint)
    let userId = null;
    const session = await getServerSession(authOptions);
    
    if (session?.user?.id) {
      userId = session.user.id;
    } else {
      const authHeader = request.headers.get('Authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          userId = decoded.userId || decoded.id;
        } catch (tokenError) {
          return new Response(
            JSON.stringify({ error: "Invalid or expired token" }),
            { status: 401, headers: { "Content-Type": "application/json" } }
          );
        }
      }
    }

    if (!userId) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // Get all partnerships where the user is a dealer and status is approved
    const partnerships = await Partnership.find({
      dealer: userId,
      status: "approved"
    }).populate('company', 'name');

    const companyIds = partnerships.map(p => p.company._id.toString());

    // Get tenders from these companies
    const tenders = await Tender.find({
      createdBy: { $in: companyIds },
      status: "active"
    }).populate('createdBy', 'name')
      .sort({ createdAt: -1 });

    // For each tender, check if user has submitted a quote
    const tendersWithQuoteStatus = await Promise.all(
      tenders.map(async (tender) => {
        const quote = await TenderQuote.findOne({
          tender: tender._id,
          dealer: userId
        });
        
        return {
          ...tender.toObject(),
          userQuote: quote ? {
            _id: quote._id,
            status: quote.status,
            budget: quote.budget,
            notes: quote.notes,
            createdAt: quote.createdAt
          } : null
        };
      })
    );

    return new Response(
      JSON.stringify({ tenders: tendersWithQuoteStatus }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error fetching partner tenders:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}