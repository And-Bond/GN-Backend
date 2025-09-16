import moment from 'moment'
import constants from '../Other/constants.js'
import ScheduleEventsService from '../Services/ScheduleEventsService.js'
import TelegramService from '../Services/TelegramService.js'
import PlanningCenterService from '../Services/PlanningCenterService.js'

import { GNBot, canReactOnMessage } from '../Other/TelegramBots.js'
const { NODE_ENV, TELEGRAM_WEBHOOK_SECRET_TOKEN } = process.env
// Type imports
import type Hapi from '@hapi/hapi'
import type TelegramBot from 'node-telegram-bot-api'
import type { FilterQuery } from 'mongoose'
import type { IScheduleEvent } from '../Models/ScheduleEventsModel.js'

// /reminder command
GNBot.onText(/\/reminder/, async (payload: TelegramBot.Message) => {
    try {
        let chat = payload?.chat
        let threadId = payload?.message_thread_id
    
        const availableScheduledTypesForSend = [
            Object.entries(constants.ScheduleServiceTypesHuman).map(([key, name]) => ({text: name, callback_data: key}))
        ]

        let options: TelegramBot.SendMessageOptions = {
            reply_markup: {
                inline_keyboard: availableScheduledTypesForSend
            },
        }
        if(threadId){
            options['message_thread_id'] = threadId
        }
        await TelegramService.sendInlineMenuButtons(chat.id, `Вибери тип нагадування`, options)
    } catch (err) {
        console.error('ERROR MESSAGE HANDLER',err)
    }
})

// Get timecodes template codes
GNBot.onText(/\btimecodes\b/i, async (payload: TelegramBot.Message) => {
    try {
        const chat = payload.chat
        const threadId = payload.message_thread_id

        // Base message before songs add
        let message = `
• Часові мітки:
00:00 - Інтро
00:00 - Вступ`;

        // Will recive recent created plan with future ones and past(if not created more than 10 plans in future)
        const recentPlans = await PlanningCenterService.getPlansList(constants.PlanningCenterServiceIds.SUNDAY_SERVICE, {
            order: '-sort_date',
            per_page: 10
        });

        // Last plan from now
        const previousPlan = recentPlans.data?.data
            ?.filter(p => moment(p.attributes?.sort_date).isBefore(moment()))
            .sort((a, b) => moment(b.attributes?.sort_date).diff(moment(a.attributes?.sort_date)))[0];

        if(previousPlan){
        // Getting all songs of last plan
        const res = await PlanningCenterService.getPlanItems(constants.PlanningCenterServiceIds.SUNDAY_SERVICE, previousPlan?.id)
        const allSongs = res.data.data.filter(item => item?.attributes?.item_type === 'song')
        // Songs adding part
        for(let song of allSongs){
            message += `\n00:00 - НАЗВА (${song?.attributes?.title})`
        }

        // After songs
        message += `
00:00 - Відступ / Молитва за дітей
00:00 - Молитва за Україну / Потреби
00:00 - Слово за пожертви
00:00 - Відступ/event
00:00:00 - Проповідь / «Тема»
00:00:00 - Оголошення`

        }else{
            message = 'Вибач, не зміг знайти минулий план('
        }


        await TelegramService.sendMessage(
            chat.id,
            message,
            {
                ...(threadId ? { message_thread_id: threadId } : {})
            }
        )
    } catch (err) {
        console.error('ERROR MESSAGE HANDLER', err)
    }
})

// Answering callback query
GNBot.on('callback_query', async (payload) => {
    try{
        let chat = payload?.message?.chat
        let messageText = payload?.data
        let threadId = payload?.message?.message_thread_id
        let messageId = payload?.message?.message_id

        if(!chat || !messageText || !messageId){
            return { data: false }
        }
    
        for (const key in constants.ScheduleServiceTypesHuman) {
            // Check if it some schedule events type setting
            if(key === messageText){
                let query: FilterQuery<IScheduleEvent> = {
                    chatId: chat.id,
                    type: key,
                }
                if(threadId){
                    query['threadId'] = threadId
                }
                const isExists = await ScheduleEventsService.getOne(query)
                let sendMessage: TelegramBot.EditMessageTextOptions = {
                    chat_id: chat.id,
                    message_id: messageId
                }
                let message: string = 'Не зміг знайти що написати('
                // if(threadId){
                //     sendMessage['messageThreadId'] = threadId
                // }
                // Sunday service reminder
                if(key === constants.ScheduleServiceTypesCode.SUNDAY_SERVICE_REMINDER){
                    // Hard code every thursday
                    const nextDate = moment().utc().startOf('hour').isoWeekday(4).set({hour: 15, minute: 0})
                    if(moment().utc().isAfter(nextDate)){
                        nextDate.add(1,'week')
                    }
                    message = `Добре! Наступного разу нагадування спрацює ${moment(isExists?.nextSendAt || nextDate).utcOffset('+02:00').format('DD/MM HH:mm')}`
                    if(!isExists){
                        await ScheduleEventsService.create({
                            chatId: String(chat.id),
                            nextSendAt: nextDate.toDate(),
                            type: key,
                            threadId: String(threadId)
                        } as IScheduleEvent)
                    }
                }
                // Sunday service start timer
                if(key === constants.ScheduleServiceTypesCode.SUNDEY_SERVICE_START_TIMER_REMINDER){
                    message = `Добре! Нагадування спрацює, як тільки <b>Початок Відліку</b> буде активовано`
                    sendMessage['parse_mode'] = 'HTML'
                    if(!isExists){
                        await ScheduleEventsService.create({
                            chatId: String(chat.id),
                            // Hard code plan item that will trigger message sent
                            planItemName: 'Start Timer',
                            type: key,
                            threadId: String(threadId)
                        } as IScheduleEvent)
                    }
                }
    
                await TelegramService.editMessage(message, sendMessage)
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
        handler: async(req: Hapi.Request & { payload: TelegramBot.Update }) => {
            try {
                // On prod we are checking if it's telegram send req to us or something else
                if(NODE_ENV === 'PROD'){
                    const secretToken = req.headers["x-telegram-bot-api-secret-token"];
                    if (secretToken !== TELEGRAM_WEBHOOK_SECRET_TOKEN) {
                        console.warn("[PROD] INVALID REQUEST TO /telegram PATH!", req.headers);
                        return { data: false };
                    }
                }
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