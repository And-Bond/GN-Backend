const TelegramService = require('../Services/TelegramService')
const TelegramUserService = require('../Services/TelegramUserService')
const PlanningCenterService = require('../Services/PlanningCenterService')
const ScheduleEventsService = require('../Services/ScheduleEventsService')
const constants = require('../Other/constants')
const moment = require('moment')

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
                // res = await TelegramService.setWebhook('https://ee47-185-228-103-207.ngrok-free.app/telegram')
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
            try {
                // console.log('Incoming Message Req',req)
                let { payload } = req
                // Telegram User Functional -> rework!
                // if(payload.my_chat_member){
                //     if(
                //         payload.my_chat_member.new_chat_member.user.username === 'gn_church_bot' &&
                //         payload.my_chat_member.new_chat_member.status === 'kicked'
                //     ){
                //         await TelegramUserService.updateOne( { userId: payload.my_chat_member.chat.id }, { active: false } )
                //     }
                //     return { data: false }
                // }
                // Other text functional
                let { 
                    text: commandText,
                    date: updatedAt,
                    chat: chat,
                    from: user  
                }= payload.message

                //  Telegram User Functional -> rework!
                //  let account = await TelegramUserService.getOne({ userId: user.id })
                //  let res = await TelegramService.getChatInfo(user.id)
                //  if(!account){
                //     let userData = {
                //         userId: user.id,
                //         active: true,
                //         lastMessageAt: new Date(updatedAt)
                //     }
                //     account = await TelegramUserService.create(userData)
                //  }else{
                //     await TelegramUserService.updateOne({ _id: account._id }, { lastMessageAt: updatedAt, active: true })
                //  }

                switch(commandText){
                    case '/setschedule': {
                        const availableScheduledTypes = Object.values(constants.ScheduleServiceTypes)
                        await TelegramService.sendMenuButtons(chat.id,'Select Schedule Type',[availableScheduledTypes])
                        return { data: true }
                    }
                    default: {
                        for (const key in constants.ScheduleServiceTypes) {
                            if(constants.ScheduleServiceTypes[key] === commandText){
                                // Hard code every thursday
                                const nextDate = moment().utc().startOf('hour').add(1,'weeks').isoWeekday(4).set({hour: 13, minute: 0}).toDate()
                                await ScheduleEventsService.create({
                                    chatId: chat.id,
                                    nextSentAt: nextDate,
                                    type: key
                                })
                                await TelegramService.sendMessage(chat.id,`Success! Next time it will work at ${moment(nextDate).format('DD/MM HH:mm')} by UTC`)
                                return { data: true }
                            }
                        }
                        await TelegramService.sendMessage(chat.id,'Unknown command')
                        return { data: false }
                    }
                }
            } catch (error) {
                console.log('ROUTE ERROR',error)
                return { data: false }
            }

        },
        options: {

        }
    },
]