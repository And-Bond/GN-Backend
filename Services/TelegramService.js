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
}

const postMessage = async (message) => {
    let res = await axios.post(path + '/sendMessage', {
        chat_id: 1688733747,
        text : 'TEST'
    })
    console.log(res)
}

module.exports = {
    getMe,
    postMessage,
    getUpdates
}