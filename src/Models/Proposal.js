// Models/Proposal.js
import mongoose from 'mongoose';

const proposalSchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  agency: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  package: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Package',
    required: true
  },
  packageName: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  budget: {
    type: Number,
    required: true
  },
  timeline: {
    type: String,
    required: true
  },
  additionalRequirements: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'accepted', 'rejected', 'cancelled'],
    default: 'pending'
  },
  agencyResponse: {
    message: String,
    proposedChanges: String,
    finalQuote: Number,
    respondedAt: Date
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  respondedAt: {
    type: Date
  }
}, {
  timestamps: true
});

proposalSchema.index({ client: 1, submittedAt: -1 });
proposalSchema.index({ agency: 1, status: 1 });

export default mongoose.models.Proposal || mongoose.model('Proposal', proposalSchema);