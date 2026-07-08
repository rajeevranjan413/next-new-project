import { Schema, model } from 'mongoose';

// Support tickets submitted from the in-app Support Center.
// Works for both registered users (userId + snapshot populated) and guests.
const ticketSchema = new Schema(
  {
    ref:          { type: String, required: true, unique: true, index: true },

    // Contact method chosen by the user: 'tg' | 'wa' | 'email'
    channel:      { type: String, enum: ['tg', 'wa', 'email'], required: true },
    channelLabel: { type: String, default: '' },   // human label e.g. "Telegram"
    contact:      { type: String, required: true }, // handle / number / email
    description:  { type: String, required: true },

    // Optional link to a registered account (null for guests)
    user:         { type: Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    isGuest:      { type: Boolean, default: true },
    // Snapshot of who submitted — kept even if the user record changes later
    userSnapshot: {
      name:        { type: String, default: '' },
      email:       { type: String, default: '' },
      phone:       { type: String, default: '' },
      countryCode: { type: String, default: '' },
    },

    status:     { type: String, enum: ['open', 'in_progress', 'resolved'], default: 'open', index: true },
    adminNote:  { type: String, default: '' },
  },
  { timestamps: true }
);

export default model('Ticket', ticketSchema);
