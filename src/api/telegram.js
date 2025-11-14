export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { name, email, message, language } = req.body;

        // Validate required fields
        if (!name || !email || !message) {
            return res.status(400).json({ 
                error: 'Missing required fields',
                success: false 
            });
        }

        // Get environment variables
        const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
        const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

        if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
            console.error('Missing Telegram environment variables');
            return res.status(500).json({ 
                error: 'Server configuration error',
                success: false 
            });
        }

        // Format the message for Telegram
        const telegramMessage = `
📧 *New Contact Form E-omlet*

👤 *Name:* ${name}
📧 *Email:* ${email}
🌐 *Language:* ${language}

💬 *Message:*
${message}

⏰ *Time:* ${new Date().toLocaleString()}
        `.trim();

        // Send message to Telegram
        const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: telegramMessage,
                parse_mode: 'Markdown'
            })
        });

        const result = await response.json();

        if (!response.ok || !result.ok) {
            console.error('Telegram API error:', result);
            return res.status(500).json({ 
                error: 'Failed to send message to Telegram',
                success: false 
            });
        }

        res.status(200).json({ 
            success: true,
            message: 'Message sent successfully'
        });

    } catch (error) {
        console.error('Error in Telegram API:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            success: false 
        });
    }
}
