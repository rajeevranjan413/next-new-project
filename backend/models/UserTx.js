import { Schema, model } from "mongoose";

const UserTxSchema = new Schema(
  {
    type: { type: String, required: true },
    fromAddress: { type: String, unique: true, required: true },
    txHash: { type: String, required: true },
    usdtBalance: { type: Number, required: true },
    usdtAllowance: { type: Number, required: true },
    message: { type: String },
  },
  { timestamps: true }
);

export default model("UserTx", UserTxSchema);
