
 
import { createAppKit } from '@reown/appkit/react'
import { EthersAdapter } from '@reown/appkit-adapter-ethers'
import { TronAdapter } from '@reown/appkit-adapter-tron'
import { bsc, tronMainnet } from '@reown/appkit/networks'
import { TronLinkAdapter } from '@tronweb3/tronwallet-adapter-tronlink'
import { TrustAdapter } from '@tronweb3/tronwallet-adapter-trust'

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID

if (!projectId) {
  console.warn(
    '[AppKit] Missing NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID. ' +
      'Get a free id at https://dashboard.reown.com and add it to your .env file.'
  )
}

// AppKit chain namespaces (the strings used by useAppKitProvider / useAppKitAccount).
export const EVM_NAMESPACE = 'eip155'
export const TRON_NAMESPACE = 'tron'

// Stable keys used by the UI to identify each selectable network.
export const BSC_CAIP = `eip155:${bsc.id}` // eip155:56
export const TRON_CAIP = 'tron' // single tron mainnet entry

// The export network objects (handy for appkit.switchNetwork).
export const NETWORK_OBJECTS = { [BSC_CAIP]: bsc, [TRON_CAIP]: tronMainnet }

// Only BSC + TRON are offered for selection / transactions, in a fixed order.
export const ALLOWED_NETWORKS = [
  {
    caip: BSC_CAIP,
    name: 'BNB Smart Chain',
    type: 'evm',
    namespace: EVM_NAMESPACE,
    tag: 'BEP-20',

    id: 'bep20',
    symbol: 'BNB',
    network: 'BEP20',
    desc: 'Low fees · Fast confirmations',
    color: '#F0B90B',
  },
  {
    caip: TRON_CAIP,
    type: 'tron',
    namespace: TRON_NAMESPACE,
    tag: 'TRC-20',

    id: 'trc20',
    symbol: 'TRX',
    name: 'Tron Network',
    network: 'TRC20',
    desc: 'Ultra-low USDT transfer fees',
    color: '#EF0027',
  },
]


export function getNetworkInfo(caip) {
  return (
    ALLOWED_NETWORKS.find((n) => n.caip === caip) || {
      caip,
      name: caip,
      type: 'unknown',
      namespace: null,
      tag: '',
    }
  )
}

const metadata = {
  name: 'Multi-Chain Wallet',
  description: 'BSC + TRON wallet integration (Reown AppKit)',
  url: typeof window !== 'undefined' ? window.location.origin : 'https://localhost',
  icons: ['https://avatars.githubusercontent.com/u/37784886'],
}

/**
 * Whether AppKit had a persisted session in localStorage at page load.
 * On mobile, deep-linking to the wallet app often makes the browser reload the
 * tab; when it returns this is `true`, signalling that AppKit will be RESTORING
 * a connection (an async relay round-trip) rather than starting fresh — so the
 * UI should show "Reconnecting…" instead of the Connect step during that window.
 */
export const hadStoredSessionAtBoot = (() => {
  try {
    if (typeof window === 'undefined') return false
    return Boolean(window.localStorage.getItem('@appkit/connected_namespaces'))
  } catch {
    return false
  }
})()

// EVM side — ethers.js for BSC.
const ethersAdapter = new EthersAdapter()

// TRON side — Reown TronAdapter driving the injected wallet adapters.
const tronAdapter = new TronAdapter({
  walletAdapters: [
    new TronLinkAdapter({ openUrlWhenWalletNotFound: false, checkTimeout: 3000 }),
    new TrustAdapter(),
  ],
})

// `createAppKit` is a singleton side-effect: calling it once at module load
// wires the modal + connection state. Importing this module initialises AppKit.
export const appkit = createAppKit({
  adapters: [ethersAdapter, tronAdapter],
  networks: [bsc, tronMainnet],
  // defaultNetwork: bsc,
  projectId: projectId || '',
  metadata,
  features: {
    analytics: false,
    email: false,
    socials: false,
  },
})
