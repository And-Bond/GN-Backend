const TelegramBot = require('node-telegram-bot-api');

require('dotenv').config();
const { TELEGRAM_KEY, NODE_ENV, RAILWAY_PUBLIC_DOMAIN: API_PATH} = process.env
const API_HOST = process.env.API_HOST || 3000; // Port for your bot server
const ngrok = require('ngrok');
const constants = require('./constants')

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

const canReactOnMessage = (payload) => {
  // For now we work only when user or send message or clicking callback button
  if(!payload.message && !payload.callback_query){
    return false
  }

  let message;
  let chat;
  switch(true){
    case !!payload.message: {
      message = payload.message.text
      chat = payload.message.chat
      break
    }
    case !!payload.callback_query: {
      message = payload.callback_query.data
      chat = payload.callback_query.message.chat
      break
    }
  }

  if(!message || !chat){
    return false
  }

  if((chat.type === 'group' || chat.type === 'supergroup') && (!message.includes(constants.BotName) && !payload.callback_query)){
    return false
  }else{
    message = message.replaceAll(constants.BotName, '')
  }

  return payload
}

// Step 3: Initialize the bot and webhook
initTelegramBot().catch((err) => console.error('Error initializing bot:', err));

module.exports = {
    GNBot: GNBot,
    canReactOnMessage: canReactOnMessage
}