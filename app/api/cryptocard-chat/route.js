import { CHATBOT_SYSTEM } from '../../cryptocard/data';

export async function POST(request) {
  const { message } = await request.json();
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY || '',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 400,
        system: CHATBOT_SYSTEM,
        messages: [{ role: 'user', content: message }],
      }),
    });
    const data = await res.json();
    const reply = data.content?.[0]?.text || 'Technical issue. Please submit a support ticket!';
    return Response.json({ reply });
  } catch {
    return Response.json({ reply: 'Connection issue. Try again or submit a support ticket! 🙏' });
  }
}
