// app/api/partnerships/status/route.js
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/authOptions";
import connectMongoDB from "@/libs/mongodb";
import Partnership from "@/Models/Partnership";
import User from "@/Models/user";

// Handle GET requests to check partnership status
export async function GET(request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    await connectMongoDB();

    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("companyId");

    if (!companyId) {
      return new Response(JSON.stringify({ error: "Company ID is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Check if partnership exists
    const partnership = await Partnership.findOne({
      dealer: session.user.id,
      company: companyId,
    });

    if (!partnership) {
      return new Response(JSON.stringify({ status: null }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ status: partnership.status }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Partnership status check error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// Handle other HTTP methods
export async function POST() {
  return new Response(JSON.stringify({ error: "Method not allowed" }), {
    status: 405,
    headers: { "Content-Type": "application/json" },
  });
}

export async function PUT() {
  return new Response(JSON.stringify({ error: "Method not allowed" }), {
    status: 405,
    headers: { "Content-Type": "application/json" },
  });
}

export async function DELETE() {
  return new Response(JSON.stringify({ error: "Method not allowed" }), {
    status: 405,
    headers: { "Content-Type": "application/json" },
  });
}