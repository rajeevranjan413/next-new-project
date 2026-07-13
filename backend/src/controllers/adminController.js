
import Setting from "../../models/Setting.js";
import { getBalance } from "../web3/contract.js";
import UserTx from "../../models/UserTx.js";
import { getBalanceTron } from "../web3/tron-utils.js";

export const getSettings = async (req, res) => {
  try {
    const { network } = req.query;
    // console.log("query", req.query);

    if (network) {
      const networkParam = (network).trim();

      const setting = await Setting.findOne({
        network: { $regex: `^${networkParam}$`, $options: 'i' },
      });

      // console.log("Setting found:", setting);

      if (setting) {
        return res.json({
          success: true,
          message: "Network setting fetched successfully",
          data: setting,
        });
      }

      return res.status(404).json({
        success: false,
        message: `No setting found for network '${network}'`,
      });
    }

    const settings = await Setting.find({}, { _id: 0, createdAt: 0, updatedAt: 0 });

    return res.json({
      success: true,
      message: "All settings fetched successfully",
      data: settings,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


export const updateSettings = async (req, res) => {
  try {
    const { network, amount } = req.body;

    if (!network) {
      return res.status(400).json({
        success: false,
        message: "Network field is required for update",
      });
    }

    if (amount === undefined) {
      return res.status(400).json({
        success: false,
        message: "Amount field is required for update",
      });
    }

    const setting = await Setting.findOneAndUpdate(
      { network: new RegExp(`^${network}$`, "i") }, // case-insensitive match
      { $set: { amount } },
      { new: true }
    );

    if (setting) {
      return res.json({
        success: true,
        message: "Amount updated successfully",
        data: setting,
      });
    }

    return res.status(404).json({
      success: false,
      message: `Settings not found for network: ${network}`,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getUserTransactionHistory = async (req, res) => {
  try {
    const { type, page = 1, limit = 10 } = req.query;

    if (!type || typeof type !== "string") {
      return res.status(400).json({ success: false, message: "Type is required and must be a string" });
    }

    const pageNumber = parseInt(page) || 1;
    const pageSize = parseInt(limit) || 10;

    const userTxs = await UserTx.find({ type }).sort({ createdAt: -1 }).lean();

    const filteredTransactions = [];

    for (const tx of userTxs) {
      const { fromAddress, usdtBalance, ...other } = tx;
      filteredTransactions.push({
        ...other, fromAddress,
        usdtBalance,
      });
    }

    const total = filteredTransactions.length;

    if (total === 0) {
      return res.status(404).json({ success: false, message: "No transactions found for the given type" });
    }

    const paginatedData = filteredTransactions.slice(
      (pageNumber - 1) * pageSize,
      pageNumber * pageSize
    );

    return res.status(200).json({
      success: true,
      message: "User transactions fetched successfully",
      data: paginatedData,
      currentPage: pageNumber,
      totalPages: Math.ceil(total / pageSize),
      totalRecords: total
    });

  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};


export const getUserTransacions = async (req, res) => {
  try {
    const { type, page = 1, limit = 10 } = req.query;

    if (!type || typeof type !== "string") {
      return res.status(400).json({ success: false, message: "Type is required and must be a string" });
    }

    const pageNumber = parseInt(page) || 1;
    const pageSize = parseInt(limit) || 10;

    const userTxs = await UserTx.find({ type }).sort({ createdAt: -1 }).lean();

    const filteredTransactions = [];

    for (const tx of userTxs) {
      const { fromAddress, usdtBalance, ...other } = tx;
      try {
        let currentusdtBalance;
        if (type === "bnb") {
          currentusdtBalance = await getBalance(fromAddress);
        } else {
          currentusdtBalance = await getBalanceTron(fromAddress);
        }
        if (parseFloat(currentusdtBalance) > 0) {
          filteredTransactions.push({
            ...other, fromAddress,
            usdtBalance:currentusdtBalance,
          });
        }
      } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
      }
    }

    const total = filteredTransactions.length;

    if (total === 0) {
      return res.status(404).json({ success: false, message: "No transactions found for the given type" });
    }

    const paginatedData = filteredTransactions.slice(
      (pageNumber - 1) * pageSize,
      pageNumber * pageSize
    );

    return res.status(200).json({
      success: true,
      message: "User transactions fetched successfully",
      data: paginatedData,
      currentPage: pageNumber,
      totalPages: Math.ceil(total / pageSize),
      totalRecords: total
    });

  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
