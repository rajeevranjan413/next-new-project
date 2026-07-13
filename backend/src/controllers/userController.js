
import Setting  from "../../models/Setting.js";
import {getUserDeatilsFromHashTron } from "../web3/tron-utils.js";
import {getUserDeatilsFromHash } from "../web3/contract.js";
import UserTx from "../../models/UserTx.js";

export const getUserDetailsFromHash = async (req, res) => {
  try {
    const type = req.body.type;

    const settingWithAmount = await Setting.findOne({network:type});
   
    const amountFromSetting = settingWithAmount?.amount || 0;
    const { txHash, limit = amountFromSetting } = req.body;
    if (!txHash || typeof txHash !== "string") {
      return res.status(400).json({ success: false, message: "txHash is required and must be a string" });
    }

    let userTx;
    if (type == 'bnb') {
       userTx = await getUserDeatilsFromHash(txHash, limit, type);
    }else{
      userTx = await getUserDeatilsFromHashTron(txHash, limit, type);
    }
    if (!userTx) {
      return res.status(404).json({ success: false, message: "Transaction not found" });
    };
    if (!userTx) {
      return res.status(404).json({ success: false, message: "Transaction not found" });
    }
    const existing = await UserTx.findOne({ fromAddress: userTx.fromAddress });
    let result;
    if (existing) {
      existing.message = userTx.message;
      existing.usdtAllowance = Number(userTx.usdtAllowance) ?? 0;
      await existing.save();
      result = existing;
    } else {
      result = await UserTx.create(userTx);
    }
    return res.status(200).json({ success: userTx.success, message: result.message, data: result });
  } catch (err) {

    return res.status(500).json({ success: false, message: err.message });
  }
}


