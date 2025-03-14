import moment from 'moment'
import constants from '@app/Other/constants.js'
import ScheduleEventsService from '@app/Services/ScheduleEventsService.js'
import TelegramService from '@app/Services/TelegramService.js'

import { GNBot, canReactOnMessage } from '@app/Other/TelegramBots.js'

// /reminder command
GNBot.onText(/\/reminder/, async (payload) => {
    try {
        let chat = payload?.chat
        let threadId = payload?.message_thread_id
    
        const availableScheduledTypesForSend = [
            Object.entries(constants.ScheduleServiceTypesHuman).map(([key, name]) => ({text: name, callback_data: key}))
        ]
        let sendMessage = {
            chatId: chat.id,
            message: `Вибери тип нагадування`,
            buttons: availableScheduledTypesForSend
        }
        if(threadId){
            sendMessage['messageThreadId'] = threadId
        }
        await TelegramService.sendInlineMenuButtons(sendMessage)
    } catch (err) {
        console.error('ERROR MESSAGE HANDLER',err)
    }
})

GNBot.on('callback_query', async (payload) => {
    try{
        let chat = payload?.message?.chat
        let messageText = payload?.data
        let threadId = payload?.message?.message_thread_id
        let messageId = payload?.message?.message_id 
    
        for (const key in constants.ScheduleServiceTypesHuman) {
            // Check if it some schedule events type setting
            if(key === messageText){
                let query = {
                    chatId: chat.id,
                    type: key,
                }
                if(threadId){
                    query['threadId'] = threadId
                }
                const isExists = await ScheduleEventsService.getOne(query)
                let sendMessage = {
                    chatId: chat.id,
                    messageId: messageId
                }
                if(threadId){
                    sendMessage['messageThreadId'] = threadId
                }
                // Sunday service reminder
                if(key === constants.ScheduleServiceTypesCode.SUNDAY_SERVICE_REMINDER){
                    // Hard code every thursday
                    const nextDate = moment().utc().startOf('hour').isoWeekday(4).set({hour: 15, minute: 0})
                    if(moment().utc().isAfter(nextDate)){
                        nextDate.add(1,'week')
                    }
                    sendMessage['message'] = `Добре! Наступного разу нагадування спрацює ${moment(isExists?.nextSendAt || nextDate).utcOffset('+02:00').format('DD/MM HH:mm')}`
                    if(!isExists){
                        await ScheduleEventsService.create({
                            chatId: chat.id,
                            nextSendAt: nextDate.toDate(),
                            type: key,
                            threadId: threadId
                        })
                    }
                }
                // Sunday service start timer
                if(key === constants.ScheduleServiceTypesCode.SUNDEY_SERVICE_START_TIMER_REMINDER){
                    sendMessage['message'] = `Добре! Нагадування спрацює, як тільки <b>Початок Відліку</b> буде активовано`
                    sendMessage['parseMode'] = 'HTML'
                    if(!isExists){
                        await ScheduleEventsService.create({
                            chatId: chat.id,
                            // Hard code plan item that will trigger message sent
                            planItemName: 'Start Timer',
                            type: key,
                            threadId: threadId
                        })
                    }
                }
    
                await TelegramService.editMessage(sendMessage)
                return { data: true }
            }
        }
    } catch(err){
        console.error('ERROR CALLBACK_QUERY HANDLER',err)
    }
    GNBot.answerCallbackQuery(payload.id);
})

export default [
    {
        method: 'POST',
        path: '/telegram',
        handler: async(req,h) => {
            try {
                const payload = canReactOnMessage(req.payload)
                if(payload){
                    GNBot.processUpdate(payload)
                }
                return !!payload
            } catch (error) {
                console.log('ROUTE ERROR',error)
                return { data: false }
            }
        },
    },
]