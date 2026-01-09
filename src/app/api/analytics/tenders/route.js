import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/auth";
import connectMongoDB from "@/libs/mongodb";
import TenderQuote from "@/Models/TenderQuote";
import Tender from "@/Models/Tender";
import jwt from 'jsonwebtoken';

export async function GET(request) {
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

    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '30days';

    // Calculate date range
    const now = new Date();
    let startDate;
    switch (range) {
      case '7days':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case '90days':
        startDate = new Date(now.setDate(now.getDate() - 90));
        break;
      default: // 30 days
        startDate = new Date(now.setDate(now.getDate() - 30));
    }

    // Get dealer's tender quotes
    const tenderQuotes = await TenderQuote.find({
      dealer: userId,
      createdAt: { $gte: startDate }
    }).populate('tender');

    // Calculate statistics
    const totalQuotes = tenderQuotes.length;
    const approvedQuotes = tenderQuotes.filter(q => q.status === 'approved').length;
    const pendingQuotes = tenderQuotes.filter(q => q.status === 'submitted').length;
    const rejectedQuotes = tenderQuotes.filter(q => q.status === 'rejected').length;

    // Get recent tender activities
    const recentQuotes = await TenderQuote.find({
      dealer: userId
    })
    .populate('tender')
    .sort({ createdAt: -1 })
    .limit(5);

    const activities = recentQuotes.map(quote => ({
      type: 'tender',
      title: `Quote submitted for ${quote.tender?.title || 'Tender'}`,
      description: `Budget: $${quote.budget} - ${quote.notes || 'No additional notes'}`,
      timestamp: quote.createdAt,
      status: quote.status === 'submitted' ? 'pending' : quote.status
    }));

    return new Response(
      JSON.stringify({
        stats: {
          totalQuotes,
          approvedQuotes,
          pendingQuotes,
          rejectedQuotes
        },
        activities
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Tender analytics error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}