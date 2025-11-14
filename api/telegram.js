export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { name, contact, message, language } = req.body || {};

    if (!name || !contact || !message) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
      });
    }

    const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
      console.error('Missing Telegram credentials');
      return res.status(500).json({
        success: false,
        error: 'Server configuration error',
      });
    }

    const telegramMessage = `
📧 *StatsPage Contact Form*

👤 *Имя:* ${name}
☎️ *Контакт:* ${contact}
🌐 *Язык:* ${language || 'n/a'}

💬 *Сообщение:*
${message}

⏰ *Время отправки:* ${new Date().toLocaleString()}
    `.trim();

    const telegramResponse = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: telegramMessage,
          parse_mode: 'Markdown',
        }),
      }
    );

    const result = await telegramResponse.json();

    if (!telegramResponse.ok || !result.ok) {
      console.error('Telegram API error:', result);
      return res.status(500).json({
        success: false,
        error: 'Failed to send message to Telegram',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Message sent successfully',
    });
  } catch (error) {
    console.error('Telegram handler error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
}
