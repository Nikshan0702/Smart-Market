// Models/Tender.js
const mongoose = require('mongoose');

const TenderSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  budget: {
    type: Number,
    default: 0,
  },
  deadline: {
    type: Date,
    required: true,
  },
  location: {
    type: String,
  },
  requirements: {
    type: String,
  },
  contactEmail: {
    type: String,
    required: true,
  },
  contactPhone: {
    type: String,
  },
  brandName: {
    type: String,
    required: true,
  },
  dealers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  status: {
    type: String,
    enum: ['active', 'closed'],
    default: 'active',
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

// Add virtual for quotes
TenderSchema.virtual('quotes', {
  ref: 'TenderQuote',
  localField: '_id',
  foreignField: 'tender',
});

// Enable virtuals
TenderSchema.set('toJSON', { virtuals: true });
TenderSchema.set('toObject', { virtuals: true });

module.exports = mongoose.models.Tender || mongoose.model('Tender', TenderSchema);