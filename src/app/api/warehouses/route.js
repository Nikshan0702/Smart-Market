// app/api/warehouses/route.js
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/auth";
import connectMongoDB from "@/libs/mongodb";
import Warehouse from "@/Models/Warehouse";
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
    console.log("Warehouse creation request received");

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
        JSON.stringify({ error: "Only dealers can create warehouses" }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Parse form data
    const formData = await request.formData();
    
    const warehouseData = {
      name: formData.get('name'),
      description: formData.get('description'),
      address: formData.get('address'),
      city: formData.get('city'),
      state: formData.get('state'),
      zipCode: formData.get('zipCode'),
      totalArea: parseInt(formData.get('totalArea')),
      availableArea: parseInt(formData.get('availableArea')),
      dailyRate: parseFloat(formData.get('dailyRate')),
      minBookingDays: parseInt(formData.get('minBookingDays')) || 1,
      amenities: JSON.parse(formData.get('amenities') || '[]'),
      status: formData.get('status') || 'active'
    };

    console.log("Warehouse data received:", warehouseData);

    // Validate required fields
    if (!warehouseData.name || !warehouseData.address || !warehouseData.city || 
        !warehouseData.totalArea || !warehouseData.availableArea || !warehouseData.dailyRate) {
      console.log("Missing required fields");
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
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
                  folder: 'warehouse_images',
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

    // Create new warehouse
    const warehouse = new Warehouse({
      dealer: userId,
      ...warehouseData,
      images: imageUrls,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await warehouse.save();
    console.log("Warehouse created successfully:", warehouse._id);

    // Populate dealer info for response
    await warehouse.populate("dealer", "firstName lastName companyDetails.name");

    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Warehouse created successfully",
        warehouse 
      }),
      {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error creating warehouse:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}