// Models/MarketingAgency.js
import mongoose from 'mongoose';

const packageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: [
      'TV Advertising',
      'Social Media Marketing',
      'Creative Services',
      'Digital Strategy',
      'Content Marketing',
      'Influencer Marketing',
      'SEO/SEM',
      'Email Marketing'
    ]
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  duration: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  features: [{
    type: String
  }],
  isActive: {
    type: Boolean,
    default: true
  }
});

const marketingAgencySchema = new mongoose.Schema({
  user: {
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
  logo: {
    type: String,
    default: ''
  },
  services: [{
    type: String,
    enum: [
      'TV Advertising',
      'Social Media Marketing',
      'Creative Services',
      'Digital Strategy',
      'Content Marketing',
      'Influencer Marketing',
      'SEO/SEM',
      'Email Marketing'
    ]
  }],
  packages: [packageSchema],
  contact: {
    phone: String,
    email: String,
    website: String
  },
  location: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviews: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'suspended'],
    default: 'pending'
  },
  specialties: [String],
  yearsOfExperience: {
    type: Number,
    min: 0
  },
  portfolio: [{
    title: String,
    description: String,
    image: String,
    url: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

marketingAgencySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.models.MarketingAgency || mongoose.model('MarketingAgency', marketingAgencySchema);