import { Schema, model } from 'mongoose';

const userSchema = new Schema(
  {
    phone:         { type: String, sparse: true, index: true },
    countryCode:   { type: String, default: '+91' },
    email:         { type: String, sparse: true, index: true, lowercase: true, trim: true },
    walletAddress: { type: String, sparse: true, index: true },
    walletName:    { type: String },
    name:          { type: String, default: '' },
    passwordHash:  { type: String, select: false },
    isVerified:    { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default model('User', userSchema);
