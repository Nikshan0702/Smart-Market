// app/api/agency/packages/route.js
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/auth";
import connectMongoDB from "@/libs/mongodb";
import Package from "@/Models/Packages";
import User from "@/Models/user";
import jwt from 'jsonwebtoken';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
if (process.env.CLOUDINARY_URL) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
} else {
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
    console.log("Package creation request received");

    // Check authentication via both methods
    let userId = null;
    
    const session = await getServerSession(authOptions);
    if (session?.user?.id) {
      userId = session.user.id;
      console.log("Authenticated via NextAuth session. User ID:", userId);
    } else {
      const authHeader = request.headers.get('Authorization');
      console.log("Auth header:", authHeader);
      
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        
        try {
          if (!process.env.JWT_SECRET) {
            throw new Error("JWT secret not configured");
          }
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          console.log("Decoded token:", decoded);
          
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

    // Check if user is an agency
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

    if (user.role !== "Marketing Agency") {
      console.log("User is not an agency. Role:", user.role);
      return new Response(
        JSON.stringify({ error: "Only marketing agencies can create packages" }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Parse form data
    const formData = await request.formData();
    
    const packageData = {
      name: formData.get('name'),
      description: formData.get('description'),
      category: formData.get('category'),
      price: parseFloat(formData.get('price')),
      duration: parseInt(formData.get('duration')),
      targetAudience: formData.get('targetAudience'),
      maxRevisions: parseInt(formData.get('maxRevisions')) || 3,
      supportType: formData.get('supportType') || 'email',
      successRate: formData.get('successRate') ? parseInt(formData.get('successRate')) : null,
      status: formData.get('status') || 'active',
      deliverables: JSON.parse(formData.get('deliverables') || '[]'),
      features: JSON.parse(formData.get('features') || '[]'),
      includedServices: JSON.parse(formData.get('includedServices') || '[]'),
    };

    console.log("Package data received:", packageData);

    // Validate required fields
    if (!packageData.name || !packageData.description || !packageData.category || 
        !packageData.price || !packageData.duration) {
      console.log("Missing required fields");
      return new Response(
        JSON.stringify({ error: "Missing required fields: name, description, category, price, and duration are required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Handle image uploads
    const imageFiles = formData.getAll('images');
    const imageUrls = [];

    if (imageFiles && imageFiles.length > 0) {
      console.log(`Uploading ${imageFiles.length} images to Cloudinary...`);
      
      for (const imageFile of imageFiles) {
        if (imageFile && imageFile.size > 0) {
          try {
            const arrayBuffer = await imageFile.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            
            const uploadResult = await new Promise((resolve, reject) => {
              cloudinary.uploader.upload_stream(
                {
                  folder: 'agency_packages',
                  resource_type: 'image',
                  format: 'jpg'
                },
                (error, result) => {
                  if (error) reject(error);
                  else resolve(result);
                }
              ).end(buffer);
            });
            
            imageUrls.push(uploadResult.secure_url);
            console.log("Image uploaded to Cloudinary:", uploadResult.secure_url);
          } catch (uploadError) {
            console.error("Error uploading image to Cloudinary:", uploadError);
            return new Response(
              JSON.stringify({ error: "Failed to upload images" }),
              {
                status: 500,
                headers: { "Content-Type": "application/json" },
              }
            );
          }
        }
      }
    }

    // Create new package
    const packages = new Package({
      agency: userId,
      ...packageData,
      images: imageUrls,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await packages.save();
    console.log("Package created successfully:", packages._id);

    // Populate agency info for response
    await packages.populate("agency", "firstName lastName companyDetails.name");

    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Package created successfully",
        packages 
      }),
      {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error creating package:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

export async function GET(request) {
  try {
    await connectMongoDB();
    console.log("Fetching packages request received");

    // Check authentication via both methods
    let userId = null;
    
    const session = await getServerSession(authOptions);
    if (session?.user?.id) {
      userId = session.user.id;
      console.log("Authenticated via NextAuth session. User ID:", userId);
    } else {
      const authHeader = request.headers.get('Authorization');
      console.log("Auth header:", authHeader);
      
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        
        try {
          if (!process.env.JWT_SECRET) {
            throw new Error("JWT secret not configured");
          }
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          console.log("Decoded token:", decoded);
          
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

    // Fetch packages for this agency
    const packages = await Package.find({ agency: userId })
      .populate("agency", "firstName lastName companyDetails.name")
      .sort({ createdAt: -1 });

    console.log(`Found ${packages.length} packages for agency ${userId}`);

    return new Response(
      JSON.stringify({ 
        success: true,
        packages 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error fetching packages:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}