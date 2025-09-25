// Models/MarketingProposal.js
import mongoose from 'mongoose';

const marketingProposalSchema = new mongoose.Schema({
  corporate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  agency: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MarketingAgency',
    required: true
  },
  package: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  additionalRequirements: {
    type: String,
    default: ''
  },
  budget: {
    type: Number,
    required: true
  },
  timeline: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'under_review', 'accepted', 'rejected', 'cancelled'],
    default: 'pending'
  },
  agencyResponse: {
    message: String,
    proposedPrice: Number,
    proposedTimeline: String,
    respondedAt: Date
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

marketingProposalSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.models.MarketingProposal || mongoose.model('MarketingProposal', marketingProposalSchema);