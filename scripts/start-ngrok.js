const ngrok = require('ngrok');
const axios = require('axios');
require('dotenv').config();

const TELEGRAM_KEY = process.env.NODE_ENV !== 'LOCAL' ? process.env.TELEGRAM_KEY : process.env.TELEGRAM_NY_KEY ; // Store your bot token in a .env file
const API_HOST = process.env.API_HOST || 3000; // Port for your bot server

if (!TELEGRAM_KEY) {
  console.error('TELEGRAM_KEY is not set in .env file');
  process.exit(1);
}

(async function () {
  try {
    // Start ngrok on the specified port
    const url = await ngrok.connect(API_HOST);
    console.log(`ngrok tunnel started at: ${url}`);

    // Set Telegram Webhook
    const webhookUrl = `${url}/telegram`;
    const telegramApiUrl = `https://api.telegram.org/bot${TELEGRAM_KEY}/setWebhook`;
    const response = await axios.post(telegramApiUrl, { url: webhookUrl });

    console.log(`Webhook set successfully: ${response.data.description}`);
    console.log(`Your Webhook URL: ${webhookUrl}`);
  } catch (error) {
    console.error('Error starting ngrok or setting Webhook:', error.message);
  }
})();
