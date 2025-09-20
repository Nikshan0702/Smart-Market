import mongoose from 'mongoose';

const TenderQuoteSchema = new mongoose.Schema({
  tender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tender',
    required: true
  },
  dealer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  budget: {
    type: Number,
    required: true
  },
  notes: {
    type: String,
    default: ''
  },
  quotationFile: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['submitted', 'under_review', 'approved', 'rejected'],
    default: 'submitted'
  },
  reviewedAt: {
    type: Date
  },
  reviewNotes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Index for efficient queries
TenderQuoteSchema.index({ tender: 1, dealer: 1 }, { unique: true });
TenderQuoteSchema.index({ dealer: 1 });
TenderQuoteSchema.index({ status: 1 });

export default mongoose.models.TenderQuote || mongoose.model('TenderQuote', TenderQuoteSchema);