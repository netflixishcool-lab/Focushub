import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const licenseKeySchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    default: () => uuidv4().replace(/-/g, '').toUpperCase()
  },
  duration: {
    type: Number,
    default: 30
  },
  isRedeemed: {
    type: Boolean,
    default: false
  },
  redeemedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    sparse: true
  },
  redeemedAt: Date,
  expiresAt: Date,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  notes: String
}, { timestamps: true });

export default mongoose.model('LicenseKey', licenseKeySchema);