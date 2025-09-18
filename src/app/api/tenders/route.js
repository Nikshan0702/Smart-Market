import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/authOptions";
import connectMongoDB from "@/libs/mongodb";
import Tender from "@/Models/Tender";

// export async function POST(request) {
//   console.log("Tender API POST request received");
  
//   try {
//     const session = await getServerSession(authOptions);
//     console.log("Session:", session);

//     if (!session) {
//       console.log("Unauthorized: No session found");
//       return new Response(
//         JSON.stringify({ error: "Unauthorized" }),
//         {
//           status: 401,
//           headers: { "Content-Type": "application/json" },
//         }
//       );
//     }

//     console.log("Connecting to MongoDB...");
//     await connectMongoDB();
//     console.log("MongoDB connected");
    
//     const body = await request.json();
//     console.log("Received tender data:", body);

//     // Validate required fields
//     if (!body.title || !body.description || !body.category || !body.deadline || !body.contactEmail) {
//       console.log("Missing required fields");
//       return new Response(
//         JSON.stringify({ error: "Missing required fields" }),
//         {
//           status: 400,
//           headers: { "Content-Type": "application/json" },
//         }
//       );
//     }

//     console.log("Creating new tender...");
//     const tender = new Tender({
//       ...body,
//       createdBy: session.user.id,
//       status: "active",
//     });

//     console.log("Saving tender...");
//     await tender.save();
//     console.log("Tender saved successfully:", tender._id);

//     return new Response(JSON.stringify(tender), {
//       status: 201,
//       headers: { "Content-Type": "application/json" },
//     });
//   } catch (error) {
//     console.error("Error creating tender:", error);
//     console.error("Error stack:", error.stack);
    
//     return new Response(
//       JSON.stringify({ 
//         error: "Internal server error",
//         details: process.env.NODE_ENV === "development" ? error.message : "Something went wrong"
//       }),
//       {
//         status: 500,
//         headers: { "Content-Type": "application/json" },
//       }
//     );
//   }
// }

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    await connectMongoDB();
    
    const body = await request.json();

    const tender = new Tender({
      ...body,
      createdBy: session.user.id, // This should now work
      status: "active",
    });

    await tender.save();

    return new Response(JSON.stringify(tender), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error creating tender:", error);
    return new Response(
      JSON.stringify({ 
        error: "Internal server error",
        details: process.env.NODE_ENV === "development" ? error.message : "Something went wrong"
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

export async function GET(request) {
  console.log("Tender API GET request received");
  
  try {
    console.log("Connecting to MongoDB...");
    await connectMongoDB();
    console.log("MongoDB connected");
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const skip = (page - 1) * limit;

    console.log("Fetching tenders...");
    const tenders = await Tender.find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Tender.countDocuments();
    console.log(`Found ${tenders.length} tenders out of ${total} total`);

    return new Response(
      JSON.stringify({
        tenders,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error fetching tenders:", error);
    console.error("Error stack:", error.stack);
    
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}