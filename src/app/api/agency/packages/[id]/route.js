// app/api/agency/packages/[id]/route.js
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

export async function PUT(request, { params }) {
  try {
    await connectMongoDB();
    const { id } = params;
    console.log("Package update request received for ID:", id);

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

    // Check if package exists and belongs to the agency
    const existingPackage = await Package.findOne({ _id: id, agency: userId });
    if (!existingPackage) {
      console.log("Package not found or doesn't belong to agency");
      return new Response(
        JSON.stringify({ error: "Package not found" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Parse form data
    const formData = await request.formData();
    
    const updateData = {
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
      updatedAt: new Date()
    };

    console.log("Package update data received:", updateData);

    // Validate required fields
    if (!updateData.name || !updateData.description || !updateData.category || 
        !updateData.price || !updateData.duration) {
      console.log("Missing required fields");
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Handle images - combine existing and new images
    let imageUrls = JSON.parse(formData.get('existingImages') || '[]');

    // Handle new image uploads
    const newImageFiles = formData.getAll('newImages');
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
            console.log("New image uploaded to Cloudinary:", uploadResult.secure_url);
          } catch (uploadError) {
            console.error("Error uploading new image to Cloudinary:", uploadError);
            return new Response(
              JSON.stringify({ error: "Failed to upload new images" }),
              {
                status: 500,
                headers: { "Content-Type": "application/json" },
              }
            );
          }
        }
      }
    }

    updateData.images = imageUrls;

    // Update package
    const updatedPackage = await Package.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate("agency", "firstName lastName companyDetails.name");

    console.log("Package updated successfully:", updatedPackage._id);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Package updated successfully",
        package: updatedPackage 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error updating package:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectMongoDB();
    const { id } = params;
    console.log("Package deletion request received for ID:", id);

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

    // Check if package exists and belongs to the agency
    const existingPackage = await Package.findOne({ _id: id, agency: userId });
    if (!existingPackage) {
      console.log("Package not found or doesn't belong to agency");
      return new Response(
        JSON.stringify({ error: "Package not found" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Delete package
    await Package.findByIdAndDelete(id);
    console.log("Package deleted successfully:", id);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Package deleted successfully"
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error deleting package:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

export async function GET(request, { params }) {
  try {
    await connectMongoDB();
    const { id } = params;
    console.log("Fetching single package request for ID:", id);

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

    // Fetch single package
    const packages = await Package.findOne({ _id: id, agency: userId })
      .populate("agency", "firstName lastName companyDetails.name");

    if (!packages) {
      console.log("Package not found");
      return new Response(
        JSON.stringify({ error: "Package not found" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    console.log("Package found:", packages._id);

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
    console.error("Error fetching package:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}