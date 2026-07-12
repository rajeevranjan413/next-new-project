/**
 * Tiny framework-free pub/sub notification (toast) system.
 *
 * Any module can call `notify.success(...)` / `notify.error(...)` etc.
 * The <TransactionPopup /> component subscribes and renders the toasts.
 */
let listeners = []
let counter = 0

export function subscribe(listener) {
  listeners.push(listener)
  return () => {
    listeners = listeners.filter((l) => l !== listener)
  }
}

function emit(type, message, duration) {
  const toast = { id: ++counter, type, message, duration }
  listeners.forEach((l) => l(toast))
  return toast.id
}

export const notify = {
  success: (message, duration = 4000) => emit('success', message, duration),
  error: (message, duration = 6000) => emit('error', message, duration),
  info: (message, duration = 4000) => emit('info', message, duration),
}

/**
 * Maps raw wallet/contract/RPC errors to friendly, user-facing messages.
 * Covers: user rejection, wrong network, RPC failure, contract revert,
 * insufficient balance, transaction rejection, wallet not installed.
 */
export function parseError(error) {
  if (!error) return 'Something went wrong'

  const code = error.code
  const message = (error.message || error.reason || '').toLowerCase()

  // User rejected the wallet popup (EIP-1193 4001 / ethers ACTION_REJECTED)
  if (
    code === 4001 ||
    code === 'ACTION_REJECTED' ||
    message.includes('user rejected') ||
    message.includes('user denied') ||
    message.includes('rejected the request') ||
    message.includes('declined')
  ) {
    return 'Wallet rejected request'
  }

  // Insufficient balance / funds
  if (
    code === 'INSUFFICIENT_FUNDS' ||
    message.includes('insufficient funds') ||
    message.includes('insufficient balance') ||
    message.includes('transfer amount exceeds balance')
  ) {
    return 'Insufficient balance'
  }

  // Wrong / unsupported network
  if (message.includes('unsupported chain') || message.includes('chain mismatch')) {
    return 'Unsupported chain'
  }

  // RPC / network failure
  if (
    code === 'NETWORK_ERROR' ||
    code === 'SERVER_ERROR' ||
    code === 'TIMEOUT' ||
    message.includes('failed to fetch') ||
    message.includes('could not detect network')
  ) {
    return 'Network/RPC error. Please try again.'
  }

  // Wallet not installed
  if (message.includes('not installed') || message.includes('no provider')) {
    return 'Wallet not installed'
  }

  // Contract revert reason if available
  if (error.reason) return error.reason
  if (error.shortMessage) return error.shortMessage

  return error.message || 'Transaction failed'
}
