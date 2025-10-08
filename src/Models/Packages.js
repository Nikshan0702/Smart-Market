// Models/Package.js
import mongoose from 'mongoose';

const packageSchema = new mongoose.Schema({
  agency: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: [
      "Social Media Marketing",
      "SEO & Content Marketing",
      "PPC Advertising",
      "Email Marketing",
      "Influencer Marketing",
      "Brand Strategy",
      "Web Design & Development",
      "Video Marketing",
      "Complete Digital Marketing",
      "Local SEO"
    ]
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  duration: {
    type: Number,
    required: true,
    min: 1
  },
  deliverables: [{
    type: String,
    trim: true
  }],
  features: [{
    type: String,
    trim: true
  }],
  targetAudience: {
    type: String,
    trim: true
  },
  includedServices: [{
    type: String
  }],
  images: [{
    type: String // Cloudinary URLs
  }],
  maxRevisions: {
    type: Number,
    default: 3,
    min: 0
  },
  supportType: {
    type: String,
    enum: ['email', 'phone', 'premium', 'dedicated'],
    default: 'email'
  },
  successRate: {
    type: Number,
    min: 0,
    max: 100
  },
  caseStudies: [{
    title: String,
    description: String,
    results: String,
    image: String
  }],
  status: {
    type: String,
    enum: ['active', 'inactive', 'featured'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Index for better query performance
packageSchema.index({ agency: 1, createdAt: -1 });
packageSchema.index({ category: 1, status: 1 });
packageSchema.index({ price: 1 });

export default mongoose.models.Package || mongoose.model('Package', packageSchema);