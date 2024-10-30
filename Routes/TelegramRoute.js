const TelegramService = require('../Services/TelegramService')

module.exports = [
    {
        method: 'GET',
        path: '/test',
        handler: async(req,h) => {
            try {
                console.log('test')
                // TelegramService.getMe()
                // TelegramService.getUpdates()
                // TelegramService.postMessage()
                // TelegramService.getChatInfo()
                // TelegramService.getMemberInfoFromChat()  
                // TelegramService.createPull()
                // TelegramService.sendDice()
                // TelegramService.setWebhook('')
                await TelegramService.setWebhook('https://7a53-37-139-172-145.ngrok-free.app/telegram')
                await TelegramService.getWebhookInfo()
                return { data: true }
            } catch (error) {
                console.log('ROUTE ERROR:',error)
                return { data: false }
            }

        },
        options: {

        }
    },
    {
        method: 'POST',
        path: '/setWebhook',
        handler: (req,h) => {
            console.log('webhook')
            // TelegramService.setWebhook('https://c5df-37-139-172-145.ngrok-free.app')

            return { data: true }
        },
        options: {

        }
    },
    {
        method: 'POST',
        path: '/telegram',
        handler: async(req,h) => {
            // console.log('Incoming Message Req',req)
            let { payload } = req
            let { 
                text: commandText,
                date: updatedAt,
                chat: chat,
                from: user  
             }= payload.message

             switch(commandText){
                case '/test': {
                    // await TelegramService.sendMessage(chat.id,'Test successful')
                    await TelegramService.sendMenuButtons(chat.id,'Choose text buttons',[
                        ['test1','test2'],
                        ['test3']
                    ])
                    return { data: true }
                }
                default: {
                    await TelegramService.sendMessage(chat.id,'Unknown command')
                    return { data: false }
                }
             }
            // TelegramService.setWebhook('https://c5df-37-139-172-145.ngrok-free.app')
        },
        options: {

        }
    },
]