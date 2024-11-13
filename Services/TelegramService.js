const dotenv = require('dotenv')
const axios = require('axios')
dotenv.config()

const { TELEGRAM_KEY } = process.env

const telegramPath = 'https://api.telegram.org/bot' + TELEGRAM_KEY

const getMe = async () => {
    return axios.get(telegramPath + '/getMe')
}

const getUpdates = async () => {
    return axios.get(telegramPath + '/getUpdates')
}

const sendMessage = async (chatId, message) => {
    return axios.post(telegramPath + '/sendMessage', {
        chat_id: chatId,
        text : message
    })
}
const sendMenuButtons = async (chatId, message, buttons) => {
    return axios.post(`${telegramPath}/sendMessage`, {
        chat_id: chatId,
        text: message,
        reply_markup: {
            keyboard: buttons.map(row => row.map(text => ({ text }))),
            resize_keyboard: true,
            one_time_keyboard: true
        }
    });
};

const getChatInfo = async (chatId) => {
    return axios.get(telegramPath + `/getChat?chat_id=${chatId}`)
}

const getMemberInfoFromChat = async (chatId, userId) => {
    return axios.get(telegramPath + `/getChatMember?chat_id=-${chatId}&user_id=${userId}`)
}

const createPull = async (chatId, question, options, isAnonymous) => {
    return axios.post(telegramPath + '/sendPoll', {
        chat_id: chatId,
        question: question,
        options: options,
        is_anonymous: isAnonymous
    })
}

const sendDice = async (chatId) => {
    return axios.post(telegramPath + '/sendDice', {
        chat_id: chatId
    })
}

const setWebhook = async (path) => {
    let url = encodeURI(path)
    return axios.post(telegramPath + '/setWebhook',{
        url: url
    })
}

const getWebhookInfo = async () => {
    return axios.post(telegramPath + '/getWebhookInfo')
}

const deleteWebhook = async () => {
    return axios.post(telegramPath + '/deleteWebhook')
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
    deleteWebhook
}