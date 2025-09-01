// pages/api/user/login.js
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import connectMongoDB from '@/libs/mongodb';
import User from '@/Models/user';

export async function POST(request) {
  try {
    // Connect to MongoDB
    await connectMongoDB();

    // Parse request body
    const { email, password } = await request.json();

    // Validate inputs
    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return NextResponse.json(
        { message: 'No account found with this email' },
        { status: 401 }
      );
    }

    // Check if account is active
    if (user.status !== 'active') {
      return NextResponse.json(
        { message: 'Account is not active. Please contact support.' },
        { status: 401 }
      );
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { message: 'Incorrect password' },
        { status: 401 }
      );
    }

    // Check if JWT_SECRET is set
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET environment variable is not set');
      return NextResponse.json(
        { message: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Create JWT token
    const token = jwt.sign(
      { 
        userId: user._id, 
        email: user.email,
        role: user.role,
        isPlatformAdmin: user.isPlatformAdmin
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' } // Longer expiration for better UX
    );

    // Return success response
    return NextResponse.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        isPlatformAdmin: user.isPlatformAdmin,
        company: user.companyDetails // Include company details if needed
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}