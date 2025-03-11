const TelegramBot = require('node-telegram-bot-api');

require('dotenv').config();
const { TELEGRAM_KEY, NODE_ENV, RAILWAY_PUBLIC_DOMAIN: API_PATH} = process.env
const API_HOST = process.env.API_HOST || 3000; // Port for your bot server
const constants = require('./constants')
const axios = require('axios')

const GNBot = new TelegramBot(TELEGRAM_KEY, { webHook: true });

// Dev dependencies
let ngrok;
if(NODE_ENV !== 'PROD'){
  ngrok = require('ngrok');
}

// Error counter
let errorCounter = 0

const start = async() => {
  let webhookUrl = API_PATH;
  // Step 1: Check if we are in production or development
  if (NODE_ENV !== 'PROD') {
    console.log('Starting ngrok for development...');
   await axios.get(`http://localhost:4040/api/tunnels`)
   .then(async(data) => {
      if(data?.data?.tunnels?.length){
        const tunnel = data.data.tunnels[0];
        webhookUrl = tunnel.public_url;
      }else{
        webhookUrl = await ngrok.connect(API_HOST);
      }
    })
    .catch(async(error) => {
      webhookUrl = await ngrok.connect(API_HOST);
    })

    console.log('Ngrok URL:', webhookUrl);
  }

  // Step 2: Set the webhook URL dynamically
  webhookUrl += '/telegram';
  await GNBot.setWebHook(webhookUrl);
  console.log('Telegram Webhook set to:', webhookUrl);
}

const initTelegramBot = async () => {
  try {
    await start()
  } catch (error) {
    console.error('Error starting Telegram Bot:', error.message || error.errors);
    errorCounter++
    if(errorCounter > 3){
      console.error('Failed to start Telegram Bot after 3 attempts. Last known error:', error.message || error.errors);
      return
    }
    await initTelegramBot()
  }
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

module.exports = {
    GNBot: GNBot,
    initTelegramBot: initTelegramBot,
    canReactOnMessage: canReactOnMessage
}