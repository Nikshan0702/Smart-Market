import mongoose from 'mongoose';

const tenderSchema = new mongoose.Schema({
  title: {
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
    enum: ['construction', 'it', 'supplies', 'services', 'other']
  },
  budget: {
    type: Number,
    min: 0
  },
  deadline: {
    type: Date,
    required: true
  },
  location: String,
  requirements: String,
  contactEmail: {
    type: String,
    required: true
  },
  contactPhone: String,
  status: {
    type: String,
    enum: ['active', 'closed', 'draft'],
    default: 'active'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

export default mongoose.models.Tender || mongoose.model('Tender', tenderSchema);