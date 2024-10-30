const dotenv = require('dotenv')
const axios = require('axios')
dotenv.config()

const { TELEGRAM_KEY } = process.env

const path = 'https://api.telegram.org/bot' + TELEGRAM_KEY

const getMe = async () => {
    let res = await axios.get(path + '/getMe')
    console.log(res.data)
}

const getUpdates = async () => {
    let res = await axios.get(path + '/getUpdates')
    console.log('%O',JSON.stringify(res.data))
    console.log('%O',res.data)
}

const sendMessage = async (chatId, message) => {
    let res = await axios.post(path + '/sendMessage', {
        chat_id: chatId,
        text : message
    })
    console.log(res.data)
}
const sendMenuButtons = async (chatId, message, buttons) => {
    const res = await axios.post(`${path}/sendMessage`, {
        chat_id: chatId,
        text: message,
        reply_markup: {
            keyboard: buttons.map(row => row.map(text => ({ text }))),
            resize_keyboard: true,
            one_time_keyboard: true
        }
    });
    console.log('Menu sent:', res.data);
};

const getChatInfo = async (chatId) => {
    let res = await axios.get(path + `/getChat?chat_id=${chatId}`)
    console.log(res.data)
}

const getMemberInfoFromChat = async (chatId, userId) => {
    let res = await axios.get(path + `/getChatMember?chat_id=-${chatId}&user_id=${userId}`)
    console.log(res.data)
}

const createPull = async (chatId) => {
    let res = await axios.post(path + '/sendPoll', {
        chat_id: -1002344597295,
        question: 'Test pull here',
        options: [
            'First',
            'Second',
            'Third',
            'Fourth'
        ],
        is_anonymous: false
    })
}

const sendDice = async (chatId) => {
    let res = await axios.post(path + '/sendDice', {
        chat_id: -1002344597295
    })
}

const setWebhook = async (path) => {
    let url = encodeURI(path)
    let res = await axios.post(path + '/setWebhook?url='+url)
    console.log(res.data)
    return;
}

const getWebhookInfo = async () => {
    let res = await axios.post(path + '/getWebhookInfo')
    console.log(res.data)
    return;
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
    sendMenuButtons
}