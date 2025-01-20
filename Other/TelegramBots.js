const TelegramBot = require('node-telegram-bot-api');

require('dotenv').config();
const { TELEGRAM_KEY, NODE_ENV, RAILWAY_PUBLIC_DOMAIN: API_PATH} = process.env
const API_HOST = process.env.API_HOST || 3000; // Port for your bot server
const ngrok = require('ngrok');

const GNBot = new TelegramBot(TELEGRAM_KEY, { webHook: true });

const initTelegramBot = async () => {
  let webhookUrl = API_PATH;

  // Step 1: Check if we are in production or development
  if (NODE_ENV !== 'PROD') {
    console.log('Starting ngrok for development...');
    webhookUrl = await ngrok.connect(API_HOST); // Use your port
    console.log('Ngrok URL:', webhookUrl);
  }

  // Step 2: Set the webhook URL dynamically
  webhookUrl += '/telegram';
  await GNBot.setWebHook(webhookUrl);
  console.log('Telegram Webhook set to:', webhookUrl);
};

// Step 3: Initialize the bot and webhook
initTelegramBot().catch((err) => console.error('Error initializing bot:', err));

module.exports = {
    GNBot: GNBot
}