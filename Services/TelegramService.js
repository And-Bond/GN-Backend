const dotenv = require('dotenv')
const axios = require('axios')
dotenv.config()

const { TELEGRAM_KEY } = process.env

const telegramPath = 'https://api.telegram.org/bot' + TELEGRAM_KEY

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

const sendMessage = async (chatId, message, options) => {
    return api.post('/sendMessage', {
        chat_id: chatId,
        text : message,
        ...options
    })
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
const sendInlineMenuButtons = async (chatId, message, buttons) => {
    return api.post('/sendMessage', {
        chat_id: chatId,
        text: message,
        reply_markup: {
            inline_keyboard: buttons.map(row =>
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
    sendInlineMenuButtons
}