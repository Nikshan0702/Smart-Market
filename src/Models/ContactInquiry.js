// Models/ContactInquiry.js
import mongoose from 'mongoose';

const contactInquirySchema = new mongoose.Schema({
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
  inquiryType: {
    type: String,
    enum: ['general', 'specific-package', 'custom-project', 'partnership'],
    default: 'general'
  },
  message: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['new', 'contacted', 'in-progress', 'resolved', 'spam'],
    default: 'new'
  },
  agencyResponse: {
    message: String,
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

contactInquirySchema.index({ client: 1, submittedAt: -1 });
contactInquirySchema.index({ agency: 1, status: 1 });

export default mongoose.models.ContactInquiry || mongoose.model('ContactInquiry', contactInquirySchema);