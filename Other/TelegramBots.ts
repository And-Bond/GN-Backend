import TelegramBot from 'node-telegram-bot-api';
import constants from '../Other/constants.js'
import axios from 'axios';
// Type imports
type Ngrok = typeof import('ngrok')

const { TELEGRAM_KEY, NODE_ENV, RAILWAY_PUBLIC_DOMAIN: API_PATH, TELEGRAM_WEBHOOK_SECRET_TOKEN} = process.env
const API_HOST = Number(process.env.API_HOST) || 3000; // Port for your bot server

if(!TELEGRAM_KEY || !API_PATH){
  console.log('IMPORTANT ENVS IS MISSING: TELEGRAM_KEY or API_PATH')
  process.exit(1)
}

if(NODE_ENV === 'PROD' && !TELEGRAM_WEBHOOK_SECRET_TOKEN){
  console.log('[PROD] IMPORTANT ENV IS MISSING: TELEGRAM_WEBHOOK_SECRET_TOKEN')
  process.exit(1)
}

const GNBot: TelegramBot = new TelegramBot(TELEGRAM_KEY, { webHook: true });

// Dev dependencies
let ngrok: Ngrok;
if(NODE_ENV !== 'PROD'){
  console.log('Installing ngrok')
  ngrok = await import('ngrok')
}

// Error counter
let errorCounter = 0

const start = async() => {
  let webhookUrl: string = API_PATH;
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
    .catch(async(_) => {
      webhookUrl = await ngrok.connect(API_HOST);
    })

    console.log('Ngrok URL:', webhookUrl);
  }

  // Step 2: Set the webhook URL dynamically
  webhookUrl += '/telegram';
  if(NODE_ENV !== 'PROD'){
    await GNBot.setWebHook(webhookUrl);
  }else{
    await GNBot.setWebHook(webhookUrl, { secret_token: TELEGRAM_WEBHOOK_SECRET_TOKEN });
  }
  console.log('Telegram Webhook set to:', webhookUrl);
}

const initTelegramBot = async () => {
  try {
    await start()
  } catch (error: any) {
    console.error('Error starting Telegram Bot:', error.message || error.errors);
    errorCounter++
    if(errorCounter > 3){
      console.error('Failed to start Telegram Bot after 3 attempts. Last known error:', error.message || error.errors);
      return
    }
    await initTelegramBot()
  }
};

const canReactOnMessage = (payload: TelegramBot.Update): false | TelegramBot.Update => {
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
      chat = payload.callback_query.message?.chat
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

export {
    GNBot,
    initTelegramBot,
    canReactOnMessage
}