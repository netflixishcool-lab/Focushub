import mongoose from 'mongoose';

const robloxScriptSchema = new mongoose.Schema({
  scriptKey: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  licenseKey: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LicenseKey',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    sparse: true
  },
  hwid: String,
  discordId: String,
  discordTag: String,
  loaderUrl: {
    type: String,
    default: 'https://api.luarmor.net/files/v4/loaders/6f16f02125f8864011d8132726c0d088.lua'
  },
  scriptContent: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastUsed: Date,
  usageCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: Date
}, { timestamps: true });

export default mongoose.model('RobloxScript', robloxScriptSchema);
