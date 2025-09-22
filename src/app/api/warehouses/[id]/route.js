// app/api/warehouses/[id]/route.js
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
}

export async function PUT(request, { params }) {
  try {
    await connectMongoDB();
    const { id } = params;
    console.log(`Update warehouse request for ID: ${id}`);

    // Check authentication via both methods
    let userId = null;
    
    const session = await getServerSession(authOptions);
    if (session?.user?.id) {
      userId = session.user.id;
      console.log("Authenticated via NextAuth session. User ID:", userId);
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
          
          if (!userId) {
            return new Response(
              JSON.stringify({ error: "Invalid token format" }),
              { status: 401, headers: { "Content-Type": "application/json" } }
            );
          }
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
        JSON.stringify({ error: "Unauthorized. Please log in." }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // Check if warehouse exists and belongs to user
    const warehouse = await Warehouse.findOne({ _id: id, dealer: userId });
    if (!warehouse) {
      console.log("Warehouse not found or access denied");
      return new Response(
        JSON.stringify({ error: "Warehouse not found or access denied" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Parse form data
    const formData = await request.formData();
    
    const updateData = {
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
      status: formData.get('status') || 'active',
      updatedAt: new Date()
    };

    console.log("Update data received:", updateData);

    // Handle new image uploads
    const newImageFiles = formData.getAll('newImages');
    const newImageUrls = [];

    if (newImageFiles && newImageFiles.length > 0) {
      console.log(`Uploading ${newImageFiles.length} new images to Cloudinary...`);
      
      for (const imageFile of newImageFiles) {
        if (imageFile && imageFile.size > 0) {
          try {
            const arrayBuffer = await imageFile.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            
            const uploadResult = await new Promise((resolve, reject) => {
              cloudinary.uploader.upload_stream(
                {
                  folder: 'warehouse_images',
                  resource_type: 'image'
                },
                (error, result) => {
                  if (error) reject(error);
                  else resolve(result);
                }
              ).end(buffer);
            });
            
            newImageUrls.push(uploadResult.secure_url);
          } catch (uploadError) {
            console.error("Error uploading image:", uploadError);
            return new Response(
              JSON.stringify({ error: "Failed to upload images" }),
              { status: 500, headers: { "Content-Type": "application/json" } }
            );
          }
        }
      }
    }

    // Get existing images that should be kept
    const existingImages = JSON.parse(formData.get('existingImages') || '[]');
    updateData.images = [...existingImages, ...newImageUrls];

    // Update warehouse
    Object.assign(warehouse, updateData);
    await warehouse.save();
    console.log("Warehouse updated successfully");

    await warehouse.populate("dealer", "firstName lastName companyDetails.name");

    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Warehouse updated successfully",
        warehouse 
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error updating warehouse:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectMongoDB();
    const { id } = params;
    console.log(`Delete warehouse request for ID: ${id}`);

    // Check authentication via both methods
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
        JSON.stringify({ error: "Unauthorized. Please log in." }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // Check if warehouse exists and belongs to user
    const warehouse = await Warehouse.findOne({ _id: id, dealer: userId });
    if (!warehouse) {
      return new Response(
        JSON.stringify({ error: "Warehouse not found or access denied" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Delete warehouse
    await Warehouse.findByIdAndDelete(id);
    console.log("Warehouse deleted successfully");

    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Warehouse deleted successfully"
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error deleting warehouse:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}