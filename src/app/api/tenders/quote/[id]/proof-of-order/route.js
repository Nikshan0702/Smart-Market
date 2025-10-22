// app/api/tenders/quote/[id]/proof-of-order/route.js
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/auth";
import connectMongoDB from "@/libs/mongodb";
import TenderQuote from "@/Models/TenderQuote";
import jwt from 'jsonwebtoken';

export async function GET(request, { params }) {
  try {
    await connectMongoDB();
    
    // Extract id from params
    const { id } = await params;
    console.log('Proof of order request for quote ID:', id);

    // Authentication
    let userId = null;
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

    // Find the quote with populated data
    const quote = await TenderQuote.findById(id)
      .populate('tender')
      .populate('dealer', 'firstName lastName email companyDetails');

    if (!quote) {
      console.log('Quote not found for ID:', id);
      return new Response(
        JSON.stringify({ error: "Quote not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    console.log('Quote found:', {
      id: quote._id,
      status: quote.status,
      hasProofOfOrder: !!quote.proofOfOrder,
      tenderCreatedBy: quote.tender?.createdBy,
      userId: userId
    });

    // Check if user is authorized (either the dealer who submitted the quote or the company who owns the tender)
    const isDealer = quote.dealer?._id?.toString() === userId;
    const isCompany = quote.tender?.createdBy?.toString() === userId;

    console.log('Authorization check:', { isDealer, isCompany, dealerId: quote.dealer?._id, tenderCreator: quote.tender?.createdBy });

    if (!isDealer && !isCompany) {
      return new Response(
        JSON.stringify({ error: "Not authorized to access this proof of order" }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }

    // Check if proof of order exists and quote is approved
    if (!quote.proofOfOrder || !quote.proofOfOrder.pdfData || quote.status !== 'approved') {
      console.log('Proof of order not available:', {
        hasProofOfOrder: !!quote.proofOfOrder,
        hasPdfData: !!(quote.proofOfOrder?.pdfData),
        status: quote.status
      });
      return new Response(
        JSON.stringify({ error: "Proof of order not available" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Convert base64 back to buffer
    const pdfBuffer = Buffer.from(quote.proofOfOrder.pdfData, 'base64');

    console.log('Sending PDF buffer, size:', pdfBuffer.length);

    // Return PDF file
    return new Response(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="proof-of-order-${quote.proofOfOrder.orderNumber || id}.pdf"`,
        'Content-Length': pdfBuffer.length.toString(),
        'Cache-Control': 'no-cache',
      },
    });

  } catch (error) {
    console.error("Error downloading proof of order:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}