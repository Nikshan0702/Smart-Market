// app/api/tenders/quote/route.js
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/auth";
import connectMongoDB from "@/libs/mongodb";
import Tender from "@/Models/Tender";
import TenderQuote from "@/Models/TenderQuote";
import Partnership from "@/Models/Partnership";
import User from "@/Models/user";
import jwt from 'jsonwebtoken';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary from environment variable
if (process.env.CLOUDINARY_URL) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
} else {
  // Parse from CLOUDINARY_URL if available
  const cloudinaryUrl = process.env.CLOUDINARY_URL;
  if (cloudinaryUrl) {
    const matches = cloudinaryUrl.match(/cloudinary:\/\/(.*):(.*)@(.*)/);
    if (matches) {
      cloudinary.config({
        cloud_name: matches[3],
        api_key: matches[1],
        api_secret: matches[2],
      });
    }
  }
}

export async function POST(request) {
  try {
    await connectMongoDB();
    console.log("Quote submission received");

    // Check authentication via both methods
    let userId = null;
    
    // First try NextAuth session
    const session = await getServerSession(authOptions);
    if (session?.user?.id) {
      userId = session.user.id;
      console.log("Authenticated via NextAuth session. User ID:", userId);
    } 
    // If no session, check for token in headers (custom auth)
    else {
      const authHeader = request.headers.get('Authorization');
      console.log("Auth header:", authHeader);
      
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        
        try {
          // Verify token
          if (!process.env.JWT_SECRET) {
            throw new Error("JWT secret not configured");
          }
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          console.log("Decoded token:", decoded);
          
          // Handle both userId and id fields in the token
          userId = decoded.userId || decoded.id;
          
          if (!userId) {
            console.error("Token does not contain user ID");
            return new Response(
              JSON.stringify({ error: "Invalid token format" }),
              {
                status: 401,
                headers: { "Content-Type": "application/json" },
              }
            );
          }
          console.log("Authenticated via JWT token. User ID:", userId);
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
      console.log("No valid authentication found");
      return new Response(
        JSON.stringify({ error: "Unauthorized. Please log in." }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Check if user is a dealer
    const user = await User.findById(userId);
    if (!user) {
      console.log("User not found for ID:", userId);
      return new Response(
        JSON.stringify({ error: "User not found" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (user.role !== "Dealer") {
      console.log("User is not a dealer. Role:", user.role);
      return new Response(
        JSON.stringify({ error: "Only dealers can submit quotes" }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const tenderId = formData.get('tenderId');
    const budget = parseFloat(formData.get('budget'));
    const notes = formData.get('notes');
    const quotationFile = formData.get('quotationFile');

    console.log("Request data:", { tenderId, budget, notes, file: quotationFile.name });

    // Check if tender exists and is active
    const tender = await Tender.findById(tenderId);
    if (!tender) {
      console.log("Tender not found for ID:", tenderId);
      return new Response(
        JSON.stringify({ error: "Tender not found" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    console.log("Found tender:", tender._id);
    console.log("Tender status:", tender.status);

    if (tender.status !== "active") {
      console.log("Tender is not active");
      return new Response(
        JSON.stringify({ error: "Tender is not active" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Check if deadline has passed
    if (new Date(tender.deadline) < new Date()) {
      console.log("Tender deadline has passed");
      return new Response(
        JSON.stringify({ error: "Tender deadline has passed" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Check if dealer has partnership with the company
    const partnership = await Partnership.findOne({
      dealer: userId,
      company: tender.createdBy.toString(),
      status: "approved"
    });

    console.log("Partnership check:", {
      dealer: userId,
      company: tender.createdBy.toString(),
      partnershipFound: !!partnership
    });

    if (!partnership) {
      console.log("No partnership found between dealer and company");
      return new Response(
        JSON.stringify({ error: "You are not partnered with this company" }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    console.log("Partnership found:", partnership._id);

    // Check if dealer has already submitted a quote
    const existingQuote = await TenderQuote.findOne({
      tender: tenderId,
      dealer: userId
    });

    if (existingQuote) {
      console.log("Dealer already submitted a quote for this tender");
      return new Response(
        JSON.stringify({ error: "You have already submitted a quote for this tender" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Upload file to Cloudinary
    let fileUrl = '';
    try {
      console.log("Uploading file to Cloudinary...");
      const arrayBuffer = await quotationFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      const uploadResult = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            folder: 'tender_quotations',
            resource_type: 'auto',
            format: 'pdf'
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        ).end(buffer);
      });
      
      fileUrl = uploadResult.secure_url;
      console.log("File uploaded to Cloudinary:", fileUrl);
    } catch (uploadError) {
      console.error("Error uploading file to Cloudinary:", uploadError);
      return new Response(
        JSON.stringify({ error: "Failed to upload quotation file" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Create new quote
    const quote = new TenderQuote({
      tender: tenderId,
      dealer: userId,
      budget,
      notes,
      quotationFile: fileUrl,
      status: "submitted"
    });

    await quote.save();
    console.log("Quote saved successfully");

    // Populate dealer info for response
    await quote.populate("dealer", "firstName lastName companyDetails.name");

    return new Response(
      JSON.stringify({ 
        message: "Quote submitted successfully",
        quote 
      }),
      {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error submitting quote:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}