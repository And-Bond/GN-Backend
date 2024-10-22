const { getMe, postMessage, getUpdates } = require('../Services/TelegramService')

module.exports = [
    {
        method: 'GET',
        path: '/test',
        handler: (req,h) => {
            console.log('test')
            // getMe()
            getUpdates()
            // postMessage()
            return { data: true }
        },
        options: {

        }
    }
]