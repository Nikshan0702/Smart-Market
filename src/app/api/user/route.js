// import { NextResponse } from "next/server";
// import connectMongoDB from "@/libs/mongodb";
// import bcrypt from 'bcryptjs';
// import User from '../../../Models/user'

// export async function POST(request) {
//   try {
//     await connectMongoDB();
    
//     const { 
//       firstName, 
//       lastName, 
//       email, 
//       mobile, 
//       password, 
//       role, 
//       company 
//     } = await request.json();

//     // Validation
//     if (!firstName || !lastName || !email || !mobile || !password) {
//       return NextResponse.json(
//         { error: 'First name, last name, email, mobile and password are required' },
//         { status: 400 }
//       );
//     }

//     // Validate email format
//     const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
//     if (!emailRegex.test(email)) {
//       return NextResponse.json(
//         { error: 'Please enter a valid email' },
//         { status: 400 }
//       );
//     }

//     // Check if user exists
//     const existingUser = await User.findOne({ email: email.toLowerCase() });
//     if (existingUser) {
//       return NextResponse.json(
//         { error: 'Email already registered' },
//         { status: 409 }
//       );
//     }

//     // Hash password
//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(password, salt);

//     // Create new user
//     const newUser = new User({
//       firstName,
//       lastName,
//       email: email.toLowerCase(),
//       mobile,
//       password: hashedPassword,
//       role: role || 'Corporate',
//       company: company || null,
//       status: 'pending' // Default status from schema
//     });

//     await newUser.save();

//     // Remove password from response
//     const userResponse = {
//       id: newUser._id,
//       firstName: newUser.firstName,
//       lastName: newUser.lastName,
//       email: newUser.email,
//       mobile: newUser.mobile,
//       role: newUser.role,
//       status: newUser.status
//     };

//     return NextResponse.json(
//       { 
//         message: 'User created successfully',
//         user: userResponse
//       },
//       { status: 201 }
//     );
    
//   } catch (error) {
//     console.error('Registration error:', error);
//     return NextResponse.json(
//       { error: error.message || 'Registration failed' },
//       { status: 500 }
//     );
//   }
// }


import { NextResponse } from "next/server";
import connectMongoDB from "@/libs/mongodb";
import bcrypt from 'bcryptjs';
import User from "@/Models/user";

export async function POST(request) {
  try {
    await connectMongoDB();
    
    const { 
      firstName, 
      lastName, 
      email, 
      mobile, 
      password, 
      role,
      companyDetails // This will contain all company information
    } = await request.json();

    // Validation
    if (!firstName || !lastName || !email || !mobile || !password || !role) {
      return NextResponse.json(
        { error: 'First name, last name, email, mobile, password, and role are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email' },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      );
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Prepare user data
    const userData = {
      firstName,
      lastName,
      email: email.toLowerCase(),
      mobile,
      password: hashedPassword,
      role,
      status: 'pending'
    };

    // Add company details if provided and role requires it
    if (role !== 'Admin' && companyDetails) {
      userData.companyDetails = {
        name: companyDetails.name || '',
        registrationNumber: companyDetails.registrationNumber || '',
        taxId: companyDetails.taxId || '',
        industryType: companyDetails.industryType || '',
        address: {
          street: companyDetails.address?.street || '',
          city: companyDetails.address?.city || '',
          country: companyDetails.address?.country || ''
        },
        website: companyDetails.website || '',
        status: 'pending_verification'
      };
    }

    // Create new user
    const newUser = new User(userData);
    await newUser.save();

    // Remove password from response
    const userResponse = {
      id: newUser._id,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      email: newUser.email,
      mobile: newUser.mobile,
      role: newUser.role,
      status: newUser.status,
      companyDetails: newUser.companyDetails
    };

    return NextResponse.json(
      { 
        message: 'User created successfully',
        user: userResponse
      },
      { status: 201 }
    );
    
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: error.message || 'Registration failed' },
      { status: 500 }
    );
  }
}