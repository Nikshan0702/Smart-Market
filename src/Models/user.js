import mongoose, { Schema } from "mongoose";

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
     // ✅ For OAuth
     provider: {
      type: String, // e.g. "google", "credentials"
      default: "credentials"
    },
    providerId: {
      type: String, // e.g. Google user ID
      sparse: true // allows null for non-Google users
    },
    profileImage: {
      type: String, // store Google profile picture or uploaded avatar
      trim: true
    },
    
    // Embedded Company Details (for users with company roles)
    companyDetails: {
      name: {
        type: String,
        trim: true
      },
      registrationNumber: {
        type: String,
        trim: true
      },
      taxId: {
        type: String,
        trim: true
      },
      industryType: {
        type: String,
        trim: true
      },
      address: {
        street: {
          type: String,
          trim: true
        },
        city: {
          type: String,
          trim: true
        },
        country: {
          type: String,
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

// Check if model already exists to prevent OverwriteModelError
const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;