// Models/TenderQuote.js
const mongoose = require('mongoose');

const TenderQuoteSchema = new mongoose.Schema({
  tender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tender',
    required: true,
  },
  dealer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  budget: {
    type: Number,
    required: true,
  },
  notes: {
    type: String,
  },
  quotationFile: {
    type: String,
  },
  status: {
    type: String,
    enum: ['submitted', 'approved', 'rejected'],
    default: 'submitted',
  },
  proofOfOrder: {
    generatedAt: {
      type: Date,
    },
    pdfData: {
      type: String, // Base64 encoded PDF
    },
    orderNumber: {
      type: String,
    },
    downloadUrl: {
      type: String, // Optional: URL if stored externally
    }
  }
}, {
  timestamps: true,
});

// Add a virtual populate to the Tender model
TenderQuoteSchema.virtual('quotes', {
  ref: 'TenderQuote',
  localField: '_id',
  foreignField: 'tender',
});

// Index for faster queries
TenderQuoteSchema.index({ tender: 1, dealer: 1 }, { unique: true });
TenderQuoteSchema.index({ status: 1 });
TenderQuoteSchema.index({ createdAt: 1 });

// Enable virtuals in JSON output
TenderQuoteSchema.set('toJSON', { virtuals: true });
TenderQuoteSchema.set('toObject', { virtuals: true });

module.exports = mongoose.models.TenderQuote || mongoose.model('TenderQuote', TenderQuoteSchema); 