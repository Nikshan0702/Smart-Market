// import { NextResponse } from "next/server";
// import User from '../../../Models/user';
// import connectMongoDB from "@/libs/mongodb";
// import bcrypt from 'bcryptjs'; 

// export async function GET(request, { params }) {
//   try {
//     await connectMongoDB();

//     // Use _id instead of id for MongoDB
//     const user = await User.findById(params.id); 

//     if (!user) {
//       return NextResponse.json(
//         { message: "User not found" },
//         { status: 404 }
//       );
//     }

//     // Remove password from response
//     const userResponse = {
//       id: user._id,
//       firstName: user.firstName,
//       lastName: user.lastName,
//       email: user.email,
//       mobile: user.mobile,
//       role: user.role,
//       company: user.company,
//       status: user.status,
//       emailVerified: user.emailVerified,
//       phoneVerified: user.phoneVerified
//     };

//     return NextResponse.json({ user: userResponse });
//   } catch (error) {
//     return NextResponse.json(
//       { message: "Error fetching user", error: error.message },
//       { status: 500 }
//     );
//   }
// }

// export async function PUT(request, { params }) {
//   try {
//     const { id } = params;
//     const { 
//       firstName, 
//       lastName, 
//       email, 
//       mobile, 
//       password, 
//       role, 
//       company,
//       status,
//       emailVerified,
//       phoneVerified
//     } = await request.json();
    
//     await connectMongoDB();
    
//     // Prepare update data
//     const updateData = { 
//       firstName, 
//       lastName, 
//       email: email.toLowerCase(), 
//       mobile,
//       role,
//       company,
//       status,
//       emailVerified,
//       phoneVerified
//     };
    
//     // Only hash and update password if provided
//     if (password) {
//       const salt = await bcrypt.genSalt(10);
//       updateData.password = await bcrypt.hash(password, salt);
//     }
    
//     const updatedUser = await User.findByIdAndUpdate(
//       id,
//       updateData,
//       { new: true, runValidators: true }
//     );
    
//     if (!updatedUser) {
//       return NextResponse.json(
//         { message: "User not found" },
//         { status: 404 }
//       );
//     }
    
//     // Remove password from response
//     const userResponse = {
//       id: updatedUser._id,
//       firstName: updatedUser.firstName,
//       lastName: updatedUser.lastName,
//       email: updatedUser.email,
//       mobile: updatedUser.mobile,
//       role: updatedUser.role,
//       company: updatedUser.company,
//       status: updatedUser.status,
//       emailVerified: updatedUser.emailVerified,
//       phoneVerified: updatedUser.phoneVerified
//     };
    
//     return NextResponse.json(
//       { message: "User updated", user: userResponse },
//       { status: 200 }
//     );
//   } catch (error) {
//     return NextResponse.json(
//       { message: "Error updating user", error: error.message },
//       { status: 500 }
//     );
//   }
// }


import { NextResponse } from "next/server";
import connectMongoDB from "@/libs/mongodb";
import User from "@/Models/user";

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const { company } = await request.json();
    
    await connectMongoDB();
    
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { company },
      { new: true }
    );
    
    if (!updatedUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    const userResponse = {
      id: updatedUser._id,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      email: updatedUser.email,
      mobile: updatedUser.mobile,
      role: updatedUser.role,
      company: updatedUser.company,
      status: updatedUser.status
    };
    
    return NextResponse.json(
      { 
        message: 'User updated successfully',
        user: userResponse
      },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('User update error:', error);
    return NextResponse.json(
      { error: error.message || 'User update failed' },
      { status: 500 }
    );
  }
}