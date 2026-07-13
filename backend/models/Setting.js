import { Schema, model } from 'mongoose';

const settingSchema = new Schema(
  {
    network: { type: String, required: true },
    amount: { type: Number},
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default model('Setting', settingSchema);
