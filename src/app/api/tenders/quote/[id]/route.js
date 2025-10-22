// app/api/tenders/quote/[id]/route.js
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/auth";
import connectMongoDB from "@/libs/mongodb";
import TenderQuote from "@/Models/TenderQuote";
import Tender from "@/Models/Tender";
import User from "@/Models/user";
import jwt from 'jsonwebtoken';
import { ProofOfOrderGenerator } from '@/libs/pdfGenerator';

export async function PUT(request, { params }) {
  try {
    await connectMongoDB();
    
    const { id } = await params;
    const { status } = await request.json();
    
    console.log('Updating quote status:', { id, status });
    
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

    // Find the quote with populated data
    const quote = await TenderQuote.findById(id)
      .populate("tender")
      .populate("dealer", "firstName lastName email companyDetails");
    
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
    
    // Update quote status
    quote.status = status;
    
    // Handle proof of order generation for approved quotes
    if (status === 'approved') {
      try {
        console.log('Generating proof of order for approved quote...');
        
        // Find the company/user who created the tender
        const company = await User.findById(quote.tender.createdBy)
          .select('firstName lastName email companyDetails role');
        
        if (!company) {
          console.error('Company not found for tender creator:', quote.tender.createdBy);
          throw new Error('Company not found');
        }

        console.log('Company found:', company.companyDetails?.name || company.firstName);
        console.log('Dealer found:', quote.dealer.companyDetails?.name || quote.dealer.firstName);
        
        // Generate proof of order PDF
        const base64PDF = ProofOfOrderGenerator.generateBase64PDF(
          quote.tender,
          quote,
          company,
          quote.dealer
        );
        
        // Extract just the base64 data (remove data:application/pdf;base64, prefix)
        const base64Data = base64PDF.split(',')[1];
        
        // Store the PDF data with the quote
        quote.proofOfOrder = {
          generatedAt: new Date(),
          pdfData: base64Data,
          orderNumber: `PO-${quote.tender._id.toString().slice(-8).toUpperCase()}-${quote._id.toString().slice(-6).toUpperCase()}`
        };
        
        console.log('Proof of order generated successfully for quote:', id);
        console.log('Order number:', quote.proofOfOrder.orderNumber);

      } catch (pdfError) {
        console.error('Error generating proof of order:', pdfError);
        // Don't fail the whole request if PDF generation fails
        // The quote status will still be updated
      }
    } else if (status === 'rejected' || status === 'submitted') {
      // Clear proof of order if status changes from approved
      quote.proofOfOrder = undefined;
    }
    
    await quote.save();
    
    // Populate for response
    const updatedQuote = await TenderQuote.findById(id)
      .populate("dealer", "firstName lastName companyDetails")
      .populate("tender");
    
    return new Response(JSON.stringify(updatedQuote), {
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