import { Schema, model } from 'mongoose';

// Ordered list of fulfilment stages a physical-card order moves through. The final
// 'cancelled' status is terminal and lives outside the linear flow.
export const ORDER_STAGES = [
  'order_placed',
  'payment_verified',
  'card_production',
  'shipped',
  'out_for_delivery',
  'delivered',
];
export const ORDER_STATUSES = [...ORDER_STAGES, 'cancelled'];

// Physical-card orders placed from the in-app order flow. Works for both registered
// users (user + snapshot populated) and guests, mirroring the Ticket model.
const orderSchema = new Schema(
  {
    ref: { type: String, required: true, unique: true, index: true },

    user:    { type: Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    isGuest: { type: Boolean, default: true },
    userSnapshot: {
      name:        { type: String, default: '' },
      email:       { type: String, default: '' },
      phone:       { type: String, default: '' },
      countryCode: { type: String, default: '' },
    },

    design: { type: String, enum: ['standard', 'custom'], default: 'standard' },

    shipping: {
      fullName:    { type: String, default: '' },
      line1:       { type: String, default: '' },
      line2:       { type: String, default: '' },
      city:        { type: String, default: '' },
      state:       { type: String, default: '' },
      zip:         { type: String, default: '' },
      country:     { type: String, default: '' },
      countryCode: { type: String, default: '' },
      phone:       { type: String, default: '' },
    },

    payMethod:  { type: String, enum: ['crypto', 'cod'], required: true },
    payNetwork: { type: String, default: '' },   // 'trc20' | 'bep20' (crypto only)
    payAddress: { type: String, default: '' },
    amount:     { type: Number, default: 0 },

    cardLast4:  { type: String, default: '' },    // the virtual card this physical card mirrors

    status: { type: String, enum: ORDER_STATUSES, default: 'order_placed', index: true },

    // Append-only history of stage changes: one entry per stage the order reached.
    timeline: [
      {
        _id:   false,
        stage: { type: String, enum: ORDER_STATUSES, required: true },
        at:    { type: Date, default: Date.now },
        note:  { type: String, default: '' },
      },
    ],

    adminNote: { type: String, default: '' },
  },
  { timestamps: true }
);

export default model('Order', orderSchema);
