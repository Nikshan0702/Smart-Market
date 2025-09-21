// app/api/tenders/[id]/route.js
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/auth";
import connectMongoDB from "@/libs/mongodb";
import Tender from "@/Models/Tender";
import TenderQuote from "@/Models/TenderQuote";
import jwt from 'jsonwebtoken';

export async function GET(request, { params }) {
  try {
    // Extract ID from the URL path
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const id = pathSegments[pathSegments.length - 1];
    
    await connectMongoDB();
    
    if (!id || id === '[id]') {
      return new Response(
        JSON.stringify({ error: "Tender ID is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    console.log("Fetching tender with ID:", id);

    // Get single tender with quotes and dealer details
    const tender = await Tender.findById(id)
      .populate("dealers", "firstName lastName companyDetails")
      .populate({
        path: "quotes",
        populate: {
          path: "dealer",
          select: "firstName lastName email companyDetails"
        }
      });
    
    if (!tender) {
      console.log("Tender not found for ID:", id);
      return new Response(
        JSON.stringify({ error: "Tender not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }
    
    console.log("Tender found:", tender._id);
    
    return new Response(JSON.stringify(tender), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching tender:", error);
    return new Response(
      JSON.stringify({ 
        error: "Internal server error",
        details: process.env.NODE_ENV === "development" ? error.message : "Something went wrong"
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}