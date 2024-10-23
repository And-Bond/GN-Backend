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

const postMessage = async (message) => {
    let res = await axios.post(path + '/sendMessage', {
        chat_id: 1688733747,
        text : 'TEST'
    })
    console.log(res.data)
}

const getChatInfo = async (chatId) => {
    let res = await axios.get(path + `/getChat?chat_id=1688733747`)
    console.log(res.data)
}

const getMemberInfoFromChat = async (chatId,userId) => {
    let res = await axios.get(path + '/getChatMember?chat_id=-1002344597295&user_id=1688733747')
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
    console.log(res.data)
}

const sendDice = async (chatId) => {
    let res = await axios.post(path + '/sendDice', {
        chat_id: -1002344597295
    })
}

module.exports = {
    getMe,
    postMessage,
    getUpdates,
    getChatInfo,
    getMemberInfoFromChat,
    createPull,
    sendDice
}