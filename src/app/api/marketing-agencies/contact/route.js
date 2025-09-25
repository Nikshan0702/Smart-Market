// app/api/marketing-agencies/contact/route.js
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/auth";
import connectMongoDB from "@/libs/mongodb";
import MarketingAgency from "@/Models/MarketingAgency";
import ContactInquiry from "@/Models/ContactInquiry";
import User from "@/Models/user";
import jwt from 'jsonwebtoken';

export async function POST(request) {
  try {
    await connectMongoDB();

    // Check authentication
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

    const body = await request.json();
    const { agencyId, message, inquiryType } = body;

    if (!agencyId) {
      return new Response(
        JSON.stringify({ error: "Agency ID is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Check if agency exists
    const agency = await MarketingAgency.findById(agencyId);
    if (!agency) {
      return new Response(
        JSON.stringify({ error: "Marketing agency not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Create contact inquiry
    const inquiry = new ContactInquiry({
      corporate: userId,
      agency: agencyId,
      message: message || 'Interested in your services',
      inquiryType: inquiryType || 'general',
      status: 'new',
      createdAt: new Date()
    });

    await inquiry.save();

    // Here you would typically send an email notification to the agency
    // await sendEmailNotification(agency, inquiry);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Contact inquiry submitted successfully",
        inquiry 
      }),
      { status: 201, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error submitting contact inquiry:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}