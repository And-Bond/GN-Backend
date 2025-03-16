import ngrok from 'ngrok';

const TELEGRAM_KEY = process.env.TELEGRAM_KEY; // Store your bot token in a .env file
const API_HOST = Number(process.env.API_HOST) || 3000; // Port for your bot server

if (!TELEGRAM_KEY) {
  console.error('TELEGRAM_KEY is not set in .env file');
  process.exit(1);
}

const { GNBot } = require('../Other/TelegramBots');

(async function () {
  try {
    // Start ngrok on the specified port
    const url = await ngrok.connect(API_HOST);
    const webhookUrl = url + '/telegram'
    console.log(`ngrok tunnel started at: ${url}`);

    const response = await GNBot.setWebHook(webhookUrl)

    console.log(`Webhook set successfully: ${response}`);
    console.log(`Your Webhook URL: ${webhookUrl}`);
  } catch (error) {
    console.error('Error starting ngrok or setting Webhook:', error.message);
  }
})();
