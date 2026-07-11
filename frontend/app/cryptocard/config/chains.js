// Networks a cardholder can settle their card on. Shown on Apply — Step 4
// (Select Network), after the wallet is connected on Step 3.
export const CHAINS = [
  {
    id: 'bep20',
    symbol: 'BNB',
    name: 'BNB Smart Chain',
    network: 'BEP20',
    desc: 'Low fees · Fast confirmations',
    color: '#F0B90B',
  },
  {
    id: 'trc20',
    symbol: 'TRX',
    name: 'Tron Network',
    network: 'TRC20',
    desc: 'Ultra-low USDT transfer fees',
    color: '#EF0027',
  },
];
