import { Schema, model } from 'mongoose';

// A CryptoCard issued to a user when they complete the apply flow. The virtual card
// is created instantly; a physical card (see Order) reuses the same number & CVV.
const cardSchema = new Schema(
  {
    user:   { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },

    holder: { type: String, default: 'CARD HOLDER' },
    brand:  { type: String, default: 'VISA' },
    number: { type: String, default: '' },              // full PAN (demo data)
    last4:  { type: String, default: '' },
    cvv:    { type: String, default: '', select: false }, // hidden by default
    expiry: { type: String, default: '' },              // MM/YY

    type:  { type: String, enum: ['virtual', 'physical'], default: 'virtual' },
    plan:  { type: String, default: 'Mool' },
    theme: { type: String, default: 'classic' },

    status:        { type: String, enum: ['active', 'frozen', 'closed'], default: 'active', index: true },
    voucherStatus: { type: String, enum: ['pending', 'unlocked'], default: 'pending' },
  },
  { timestamps: true }
);

export default model('Card', cardSchema);
