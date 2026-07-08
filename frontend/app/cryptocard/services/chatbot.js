// Local, static "AI" support brain for CryptoCard Pro.
//
// This runs fully client-side — no network, no API key, no cost — yet feels like a
// real assistant: it understands Hinglish / Hindi / English questions and answers
// with accurate, on-brand business facts. Numbers here are kept in sync with
// config/plans.js, config/content.js and the CHATBOT_SYSTEM knowledge base.
//
// How it works: each user message is normalised, then scored against every intent's
// keyword list. The highest-scoring intent wins; if nothing matches we fall back to a
// helpful catch-all. The context layer streams the chosen reply word-by-word so the
// chat reads like a live agent typing.

/* Lower-case, strip punctuation (keep % for "10%"), collapse spaces, and pad both
 * ends with a space so single-word keywords can be matched on word boundaries. */
function normalize(str) {
  return ` ${String(str)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}%\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()} `;
}

/* Multi-word keywords match as a phrase (weight 2); single-word keywords match only
 * on a full word boundary (weight 1) so "safe" doesn't fire inside "unsafe-looking". */
function scoreIntent(text, keywords) {
  let score = 0;
  for (const kw of keywords) {
    if (kw.includes(' ')) {
      if (text.includes(kw)) score += 2;
    } else if (text.includes(` ${kw} `)) {
      score += 1;
    }
  }
  return score;
}

// Ordered by priority — earlier intents win ties. Keep answers to 2-3 sentences,
// clear English, with a little emoji warmth. **bold** is rendered by ChatSheet.
// Keywords stay broad (incl. common Hinglish spellings) so the bot still understands
// varied phrasing even though it always replies in English.
const INTENTS = [
  {
    id: 'greeting',
    keywords: [
      'namaste', 'namaskar', 'hello', 'helo', 'hii', 'hiii', 'hi', 'hey', 'heya',
      'salaam', 'assalam', 'salam', 'hola', 'yo', 'good morning', 'good evening',
      'good afternoon', 'how are you', 'kaise ho', 'kaise hain', 'start',
    ],
    reply:
      "Hi there! 👋 I'm CryptoCard Pro's AI assistant. Ask me anything about card benefits, wallet safety, the **100 USDT** welcome voucher or **10% cashback** — I'm happy to help! 😊",
  },
  {
    id: 'thanks',
    keywords: [
      'thank', 'thanks', 'thanku', 'thankyou', 'thx', 'dhanyavaad', 'dhanyawad',
      'shukriya', 'shukran', 'great', 'awesome', 'nice', 'perfect', 'helpful', 'good job',
    ],
    reply:
      "You're welcome! 😊 Happy to help. If you have any other questions, just ask — I'm right here. 🙌",
  },
  {
    id: 'safety',
    keywords: [
      'safe', 'safety', 'secure', 'security', 'scam', 'fraud', 'fake', 'genuine',
      'real', 'trust', 'bharosa', 'paisa safe', 'mera paisa', 'seed', 'seed phrase',
      'private key', 'hack', 'chori', 'non custodial', 'custody', 'rug', 'risk', 'danger', 'dhoka',
    ],
    reply:
      "Absolutely safe! 🔒 CryptoCard is **non-custodial** — your funds never leave your wallet without your approval. The wallet is connected **read-only**, every transaction needs a popup approval in your own wallet, and we **never ask for your seed phrase**. 🛡️",
  },
  {
    id: 'voucher',
    keywords: [
      'voucher', '100 usdt', 'welcome', 'bonus', 'claim', 'pending', 'unlock',
      'gift', 'welcome voucher', 'welcome bonus',
    ],
    reply:
      'Every plan comes with a **100 USDT** welcome voucher! 🎁 Just apply and connect your wallet — the voucher shows as **PENDING**, then the moment you make any **100 USDT+** transaction it auto-claims into your Wallet Balance. ✅',
  },
  {
    id: 'cashback',
    keywords: [
      'cashback', 'cash back', '10%', 'reward', 'rewards', 'discount', 'return',
      'cash back', 'swipe',
    ],
    reply:
      'You get a straight **10% cashback** on every swipe! 💸 It\'s automatically credited in **USDT** to your Reward Balance — no minimum, no limit, and it applies to every card plan. 🎉',
  },
  {
    id: 'benefits',
    keywords: [
      'fayde', 'fayede', 'faide', 'benefit', 'benefits', 'features', 'feature',
      'kya milta', 'advantage', 'perks', 'why card', 'why cryptocard', 'kyu', 'why',
    ],
    reply:
      'CryptoCard has plenty of perks! 🎉 It works on Visa POS in **190+ countries**, gives **10% cashback** on every swipe, a **100 USDT** welcome voucher, a completely **FREE** virtual card, and bank-level security (non-custodial — your keys stay with you). 💳🔒',
  },
  {
    id: 'plans',
    keywords: [
      'plan', 'plans', 'price', 'pricing', 'cost', 'fee', 'fees', 'kitna', 'kitne',
      'charge', 'charges', 'mool', 'pro', 'premium', 'free', 'subscription',
      'monthly', 'month', 'kimat',
    ],
    reply:
      'There are 3 plans 👉 **Mool (FREE forever)**, **Pro (19.99 USDT/mo)** and **Premium (49.99 USDT/mo)**. All three include the **100 USDT** voucher + **10% cashback**, and the virtual card is free and issued instantly. 💳',
  },
  {
    id: 'physical',
    keywords: [
      'physical', 'plastic', 'delivery', 'deliver', 'ship', 'shipping', 'courier',
      'kab milega', 'address', 'ghar', 'post', 'physical card',
    ],
    reply:
      'A physical card is optional — just a **10 USDT** fee, delivered in **7–10 days**. 📦 Choose a standard or custom design; it keeps the same card number & CVV as your virtual card. ✨',
  },
  {
    id: 'apply',
    keywords: [
      'apply', 'kaise banaye', 'kaise banega', 'kaise banwaye', 'how to get',
      'how to apply', 'register', 'signup', 'sign up', 'banwana', 'kaise le',
      'kaise milega', 'create card', 'card kaise', 'get card', 'get a card',
    ],
    reply:
      "Getting a card is easy! 📝 Tap **Apply** → enter your details → pick a plan and card design → connect your wallet. Your virtual card is issued **instantly** — no paperwork needed! 🚀",
  },
  {
    id: 'wallet_connect',
    keywords: [
      'connect wallet', 'wallet connect', 'metamask', 'trust wallet', 'link wallet',
      'wallet jodna', 'kaise connect', 'wallet kaise', 'connect kaise', 'how to connect',
      'connect', 'reconnect', 'link my wallet',
    ],
    reply:
      'Connecting a wallet takes about 10 seconds! 🔗 In the apply flow, tap **Connect Wallet** and approve your wallet (like MetaMask or Trust). It\'s a **read-only** connection — we only view your balance and never ask for your seed phrase. 🔐',
  },
  {
    id: 'balance',
    keywords: [
      'balance', 'wallet balance', 'voucher balance', 'reward balance', 'mera balance',
      'kitna paisa',
    ],
    reply:
      'You have 3 types of balance 👇\n• **Wallet Balance** — your own crypto\n• **Voucher Balance** — bonus (locked until the condition is met)\n• **Reward Balance** — your cashback earnings\nEverything updates live in the app. 📊',
  },
  {
    id: 'topup',
    keywords: [
      'top up', 'topup', 'add money', 'load', 'recharge', 'deposit', 'paisa dalna',
      'fund', 'load money', 'add funds', 'paise dalna',
    ],
    reply:
      'Top-up is simple! 💰 Open the Wallet screen, connect a supported wallet, and transfer **USDT** to your card address. Your balance updates automatically once the transfer confirms. ⚡',
  },
  {
    id: 'exchange',
    keywords: [
      'exchange', 'convert', 'conversion', 'local currency', 'rupee', 'inr',
      'withdraw', 'cash out', 'atm', 'kharch', 'kaharch', 'use kaise', 'spend', 'how to use',
    ],
    reply:
      "We're a real-time exchange bridge! 🌍 Whenever you swipe your card, your crypto is instantly converted at the live rate into local currency for the merchant — across **190+ countries** and every Visa POS. 💳",
  },
  {
    id: 'countries',
    keywords: [
      'countries', 'country', 'kahan', 'international', 'global', 'accept', 'visa',
      'amazon', 'flipkart', 'zomato', 'where can', 'worldwide',
    ],
    reply:
      'The card works in **190+ countries**! 🌎 You can swipe at Amazon, Flipkart, Zomato, petrol pumps and every Visa POS — online or offline. 🛒',
  },
  {
    id: 'human',
    keywords: [
      'human', 'agent', 'person', 'insaan', 'real person', 'customer care',
      'helpline', 'call me', 'baat karni', 'baat karna', 'talk to', 'contact team',
      'complaint', 'shikayat',
    ],
    reply:
      'Of course! 🙋 Tap the **Human support** button below or submit a support ticket — our team will reach out via Telegram/WhatsApp/email within **1–2 hours**. 💬',
  },
];

const FALLBACK =
  "Good question! 🤔 I can help with the card, plans, the **100 USDT** voucher, **10% cashback**, wallet safety and delivery. Try asking with a bit more detail — or tap **Human support** below to reach our team. 🙏";

/**
 * Returns a business-accurate reply for the given user message. Pure & synchronous —
 * the streaming/typing feel is added by the caller (CryptoCardContext.sendChat).
 */
export function getBotReply(message) {
  const text = normalize(message);
  let best = null;
  let bestScore = 0;
  for (const intent of INTENTS) {
    const score = scoreIntent(text, intent.keywords);
    if (score > bestScore) {
      bestScore = score;
      best = intent;
    }
  }
  return best ? best.reply : FALLBACK;
}
