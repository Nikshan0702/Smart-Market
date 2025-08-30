import mongoose, { Schema } from "mongoose";

// User Schema for individual users
const userSchema = new Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      unique: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please enter a valid email"]
    },
    mobile: {
      type: String,
      required: [true, "Mobile number is required"],
      trim: true
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 8
    },
    role: {
      type: String,
      required: [true, "Role is required"],
      enum: ['Corporate', 'Dealer', 'Marketing Agency', 'Admin'],
      default: 'Corporate'
    },
    // Reference to company if user belongs to one
    company: {
      type: Schema.Types.ObjectId,
      ref: 'Company'
    },
    // For platform-level admins
    isPlatformAdmin: {
      type: Boolean,
      default: false
    },
    emailVerified: {
      type: Boolean,
      default: false
    },
    phoneVerified: {
      type: Boolean,
      default: false
    },
    status: {
      type: String,
      enum: ['active', 'pending', 'suspended'],
      default: 'pending'
    }
  },
  {
    timestamps: true,
  }
);

// Company Schema for corporate entities
const companySchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Company name is required"],
      trim: true
    },
    registrationNumber: {
      type: String,
      required: [true, "Registration number is required"],
      trim: true
    },
    taxId: {
      type: String,
      required: [true, "Tax ID is required"],
      trim: true
    },
    industryType: {
      type: String,
      required: [true, "Industry type is required"],
      trim: true
    },
    address: {
      street: {
        type: String,
        required: [true, "Street address is required"],
        trim: true
      },
      city: {
        type: String,
        required: [true, "City is required"],
        trim: true
      },
      country: {
        type: String,
        required: [true, "Country is required"],
        trim: true
      }
    },
    website: {
      type: String,
      trim: true
    },
    logo: {
      type: String, // URL to stored image
      trim: true
    },
    kycDocuments: [{
      name: String,
      url: String, // URL to stored document
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }],
    // Primary admin user who created the company
    adminUser: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    status: {
      type: String,
      enum: ['pending_verification', 'verified', 'rejected'],
      default: 'pending_verification'
    },
    verificationNotes: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true,
  }
);

// OTP Schema for email/phone verification
const otpSchema = new Schema({
  email: {
    type: String,
    required: true
  },
  otp: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 600 // OTP expires after 10 minutes (600 seconds)
  }
});

const User = mongoose.models.User || mongoose.model("User", userSchema);
const Company = mongoose.models.Company || mongoose.model("Company", companySchema);
const OTP = mongoose.models.OTP || mongoose.model("OTP", otpSchema);

export { User, Company, OTP };