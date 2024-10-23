const { getMe, postMessage, getUpdates, getChatInfo, getMemberInfoFromChat, createPull, sendDice } = require('../Services/TelegramService')

module.exports = [
    {
        method: 'GET',
        path: '/test',
        handler: (req,h) => {
            console.log('test')
            // getMe()
            // getUpdates()
            // postMessage()
            // getChatInfo()
            // getMemberInfoFromChat()
            // createPull()
            // sendDice()

            return { data: true }
        },
        options: {

        }
    }
]