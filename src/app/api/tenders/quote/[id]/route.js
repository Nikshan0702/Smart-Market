// app/api/tenders/quote/[id]/route.js
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/auth";
import connectMongoDB from "@/libs/mongodb";
import TenderQuote from "@/Models/TenderQuote";
import Tender from "@/Models/Tender";
import jwt from 'jsonwebtoken';

export async function PUT(request, { params }) {
  try {
    await connectMongoDB();
    
    const { id } =  await params;
    const { status } = await request.json();
    
    let userId = null;
    
    // Check authentication
    const session = await getServerSession(authOptions);
    if (session?.user?.id) {
      userId = session.user.id;
    } else {
      const authHeader = request.headers.get('Authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        try {
          if (!process.env.JWT_SECRET) {
            throw new Error("JWT secret not configured");
          }
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          userId = decoded.userId || decoded.id;
        } catch (tokenError) {
          console.error("Token verification error:", tokenError);
          return new Response(
            JSON.stringify({ error: "Invalid or expired token" }),
            {
              status: 401,
              headers: { "Content-Type": "application/json" },
            }
          );
        }
      }
    }

    if (!userId) {
      return new Response(
        JSON.stringify({ error: "Unauthorized. Please log in." }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const quote = await TenderQuote.findById(id).populate("tender");
    
    if (!quote) {
      return new Response(
        JSON.stringify({ error: "Quote not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }
    
    // Check if user owns the tender associated with this quote
    if (quote.tender.createdBy.toString() !== userId) {
      return new Response(
        JSON.stringify({ error: "Not authorized to update this quote" }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }
    
    quote.status = status;
    await quote.save();
    
    await quote.populate("dealer", "firstName lastName companyDetails");
    
    return new Response(JSON.stringify(quote), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error updating quote:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}