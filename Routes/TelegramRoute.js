const TelegramService = require('../Services/TelegramService')
const TelegramUserService = require('../Services/TelegramUserService')
const PlanningCenterService = require('../Services/PlanningCenterService')

const SundayServiceId = '1410194'

module.exports = [
    {
        method: 'GET',
        path: '/test',
        handler: async(req,h) => {
            try {
                console.log('test')
                let res;
                // res = await TelegramService.getChatInfo(1688733747)
                // res = await TelegramService.sendMessage(1688733747,'Yo')
                // TelegramService.getMe()
                // res = await TelegramService.getUpdates()
                // TelegramService.postMessage()
                // TelegramService.getChatInfo()
                // TelegramService.getMemberInfoFromChat()  
                // TelegramService.createPull()
                // TelegramService.sendDice()
                // await TelegramService.setWebhook('')
                // res = await TelegramService.setWebhook('https://e6e6-212-55-90-219.ngrok-free.app/telegram')
                // res = await TelegramService.getWebhookInfo()
                // res = await TelegramService.deleteWebhook()

                // Part with songs
                // res = await PlanningCenterService.getPlansList(SundayServiceId)
                // let nextSundayPlan = res.data?.data?.[0]
                // res = await PlanningCenterService.getPlanItems(SundayServiceId,nextSundayPlan?.id)
                // let allSongs = res.data.data.filter(item => item.attributes.item_type === 'song')
                // let testArrangmentId = allSongs[2]?.relationships?.arrangement?.data?.id
                // let testSongId = allSongs[2]?.relationships?.song?.data?.id
                // res = await PlanningCenterService.getAttachmentsBySongArrangement(testSongId,testArrangmentId)
                //  ////////////////////////////
                return { data: res.data }
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
        path: '/telegram',
        handler: async(req,h) => {
            // console.log('Incoming Message Req',req)
            let { payload } = req
            // IS bot blocked
            if(payload.my_chat_member){
                if(
                    payload.my_chat_member.new_chat_member.user.username === 'gn_church_bot' &&
                    payload.my_chat_member.new_chat_member.status === 'kicked'
                ){
                    await TelegramUserService.updateOne( { userId: payload.my_chat_member.chat.id }, { active: false } )
                }
                return { data: false }
            }
            // Other text functional
            let { 
                text: commandText,
                date: updatedAt,
                chat: chat,
                from: user  
             }= payload.message

             let account = await TelegramUserService.getOne({ userId: user.id })
             let res = await TelegramService.getChatInfo(user.id)
             if(!account){
                let userData = {
                    userId: user.id,
                    active: true,
                    lastMessageAt: new Date(updatedAt)
                }
                account = await TelegramUserService.create(userData)
             }else{
                await TelegramUserService.updateOne({ _id: account._id }, { lastMessageAt: updatedAt, active: true })
             }

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
        },
        options: {

        }
    },
]