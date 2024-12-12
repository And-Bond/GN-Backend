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
                return { message: 'This is test GET route, if you see this all is working fine'}
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
                let commandText;
                let chat;
                let from;
                let { payload } = req
                // Inline command
                if(payload?.message){
                    commandText = payload?.message?.text
                    chat = payload?.message?.chat
                    from = payload?.message?.from
                    threadId = payload?.message?.message_thread_id
                }
                // Command through buttons
                if(payload?.callback_query){
                    commandText = payload.callback_query.data
                    from = payload?.callback_query?.from
                    chat = payload?.callback_query?.message?.chat
                    threadId = payload?.callback_query?.message?.message_thread_id 
                }
                if(!chat){
                    console.error('Invalid chat variable!',payload)
                    return 'Не можу знайти потрібні дані, вибачте('
                }
                // If command was sent from group we trim it because it will start with bot name
                if(['group','supergroup'].includes(chat.type) && commandText.includes(constants.BotName)){
                    commandText = commandText.replaceAll(constants.BotName,'')
                }
                // We can't define command text, ignore
                if(!commandText){
                    return 'Вибачте, але я не розумію, що ви від мене хочете('
                }
                switch(commandText){
                    case '/reminder': {
                        const availableScheduledTypesForSend = [
                            Object.entries(constants.ScheduleServiceTypesHuman).map(([key, name]) => ({text: name, callback_data: key}))
                        ]
                        let payload = {
                            chatId: chat.id,
                            message: `Вибери тип нагадування`,
                            buttons: availableScheduledTypesForSend
                        }
                        if(threadId){
                            payload['messageThreadId'] = threadId
                        }
                        await TelegramService.sendInlineMenuButtons(payload)
                        return { data: true }
                    }
                    default: {
                        for (const key in constants.ScheduleServiceTypesHuman) {
                            // Check if it some schedule events type setting
                            if(key === commandText){
                                const isExists = await ScheduleEventsService.getOne(
                                    {
                                        chatId: chat.id,
                                        type: key
                                    }
                                )
                                let payload = {
                                    chatId: chat.id,
                                    message: `Добре! Наступного разу нагадування спрацює ${moment(isExists.nextSendAt).utcOffset('+02:00').format('DD/MM HH:mm')}`
                                }
                                if(threadId){
                                    payload['messageThreadId'] = threadId
                                }
                                // Do not create dups
                                if(isExists){
                                    await TelegramService.sendMessage(payload)
                                    return { data: true }
                                }
                                // Hard code every thursday
                                const nextDate = moment().utc().startOf('hour').isoWeekday(4).set({hour: 15, minute: 0})
                                if(moment().utc().isAfter(nextDate)){
                                    nextDate.add(1,'week')
                                }
                                await ScheduleEventsService.create({
                                    chatId: chat.id,
                                    nextSendAt: nextDate.toDate(),
                                    type: key
                                })
                                await TelegramService.sendMessage(payload)
                                return { data: true }
                            }
                        }
                        return { data: true }
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