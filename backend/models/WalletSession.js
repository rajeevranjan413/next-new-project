import { Schema, model } from 'mongoose';

const walletSessionSchema = new Schema(
  {
    walletId:   { type: String, required: true },
    walletName: { type: String },
    balance:    { type: String },          // stored as string — e.g. "324.50"
    isActive:   { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default model('WalletSession', walletSessionSchema);
