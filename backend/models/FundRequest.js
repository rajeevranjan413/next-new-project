import { Schema, model } from 'mongoose';

// Add-Funds requests raised from the in-app "Add Funds" flow. A request is created
// as `pending` when the user taps "I've sent the payment"; an admin then approves
// (credits the user's walletBalance) or rejects it. Mirrors the Order model's
// admin-driven lifecycle, but the flow is linear: pending → approved | rejected.
export const FUND_STATUSES = ['pending', 'approved', 'rejected'];

const fundRequestSchema = new Schema(
  {
    ref: { type: String, required: true, unique: true, index: true },

    // Unlike orders/tickets, an add-fund request is always tied to an account —
    // the balance has to land somewhere.
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    userSnapshot: {
      name:        { type: String, default: '' },
      email:       { type: String, default: '' },
      phone:       { type: String, default: '' },
      countryCode: { type: String, default: '' },
    },

    amount:     { type: Number, required: true, min: 0 },
    network:    { type: String, default: '' },   // 'trc20' | 'bep20'
    payAddress: { type: String, default: '' },    // the receiving address shown to the user
    txHash:     { type: String, default: '' },    // optional, if the user supplies one

    status: { type: String, enum: FUND_STATUSES, default: 'pending', index: true },

    // Set once when the request is approved, so re-approving is a safe no-op.
    credited:   { type: Boolean, default: false },
    decidedAt:  { type: Date, default: null },

    adminNote: { type: String, default: '' },
  },
  { timestamps: true }
);

export default model('FundRequest', fundRequestSchema);
