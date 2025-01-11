const dotenv = require('dotenv')
const axios = require('axios')
dotenv.config()

const { TELEGRAM_KEY, TELEGRAM_PP_KEY, NODE_ENV } = process.env

const telegramPath = 'https://api.telegram.org/bot' + (NODE_ENV !== 'LOCAL' ? TELEGRAM_KEY : TELEGRAM_PP_KEY)

const api = axios.create(
    {
        baseURL: telegramPath
    }
)

const getMe = async () => {
    return api.get('/getMe')
}

const getUpdates = async () => {
    return api.get('/getUpdates')
}

const sendMessage = async (payload) => {
    let request = {
        chat_id: payload.chatId,
        message_thread_id: payload.messageThreadId,
        text: payload.message,
    }
    if (payload.reply_markup) {
        request.reply_markup = payload.reply_markup
    }
    if(payload.parseMode){
        request['parse_mode'] = payload.parseMode
    }
    return api.post('/sendMessage',request)
}

const editMessage = async (payload) => {
    let request = {
        chat_id: payload.chatId,
        message_id: payload.messageId,
        text: payload.message,
    }
    if(payload.parseMode){
        request['parse_mode'] = payload.parseMode
    }
    return api.post('/editMessageText',request)
}

const deleteMessage = async (payload) => {
    let request = {
        chat_id: payload.chatId,
        message_id: payload.messageId,
    }
    return api.post('/deleteMessage', request)
}

/**
 * 
 * @param {string} chatId 
 * @param {string} message 
 * @param {Array<string[]>} buttons 
 * @returns 
 */
const sendMenuButtons = async (chatId, message, buttons) => {
    return api.post('/sendMessage', {
        chat_id: chatId,
        text: message,
        reply_markup: {
            keyboard: buttons.map(row => row.map(text => ({ text }))),
            resize_keyboard: true,
            one_time_keyboard: true
        }
    });
};

/**
 * 
 * @param {string} chatId 
 * @param {string} message 
 * @param {Array<{text: string, callback_data: string}[]>} buttons 
 */
const sendInlineMenuButtons = async (payload) => {
    return api.post('/sendMessage', {
        chat_id: payload.chatId,
        text: payload.message,
        message_thread_id: payload.messageThreadId,
        reply_markup: {
            inline_keyboard: payload.buttons.map(row =>
                row.map(({ text, callback_data }) => ({ text, callback_data }))
            )
        }
    });
};

const getChatInfo = async (chatId) => {
    return api.get(`/getChat?chat_id=${chatId}`)
}

const getMemberInfoFromChat = async (chatId, userId) => {
    return api.get(`/getChatMember?chat_id=-${chatId}&user_id=${userId}`)
}

const createPull = async (chatId, question, options, isAnonymous) => {
    return api.post('/sendPoll', {
        chat_id: chatId,
        question: question,
        options: options,
        is_anonymous: isAnonymous
    })
}

const sendDice = async (chatId) => {
    return api.post('/sendDice', {
        chat_id: chatId
    })
}

const setWebhook = async (path) => {
    let url = encodeURI(path)
    return api.post('/setWebhook',{
        url: url
    })
}

const getWebhookInfo = async () => {
    return api.post('/getWebhookInfo')
}

const deleteWebhook = async () => {
    return api.post('/deleteWebhook')
}

module.exports = {
    getMe,
    sendMessage,
    getUpdates,
    getChatInfo,
    getMemberInfoFromChat,
    createPull,
    sendDice,
    setWebhook,
    getWebhookInfo,
    sendMenuButtons,
    deleteWebhook,
    sendInlineMenuButtons,
    editMessage,
    deleteMessage,
}