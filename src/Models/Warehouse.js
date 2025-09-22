// Models/Warehouse.js
import mongoose from 'mongoose';

const warehouseSchema = new mongoose.Schema({
  dealer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  address: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  state: {
    type: String,
    default: ''
  },
  zipCode: {
    type: String,
    required: true
  },
  totalArea: {
    type: Number,
    required: true,
    min: 0
  },
  availableArea: {
    type: Number,
    required: true,
    min: 0
  },
  dailyRate: {
    type: Number,
    required: true,
    min: 0
  },
  minBookingDays: {
    type: Number,
    default: 1,
    min: 1
  },
  amenities: [{
    type: String
  }],
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  images: [{
    type: String
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

// Update the updatedAt field before saving
warehouseSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.models.Warehouse || mongoose.model('Warehouse', warehouseSchema);