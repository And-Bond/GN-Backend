import moment from 'moment'
import constants from '../Other/constants.js'
import ScheduleEventsService from '../Services/ScheduleEventsService.js'
import TelegramService from '../Services/TelegramService.js'
import PlanningCenterService from '../Services/PlanningCenterService.js'
import TelegramUserService from '../Services/TelegramUserService.js'

import { GNBot, canReactOnMessage } from '../Other/TelegramBots.js'
const { NODE_ENV, TELEGRAM_WEBHOOK_SECRET_TOKEN } = process.env

// Type imports
import type Hapi from '@hapi/hapi'
import type TelegramBot from 'node-telegram-bot-api'
import type { FilterQuery } from 'mongoose'
import type { IScheduleEvent } from '../Models/ScheduleEventsModel.js'

// /start command
GNBot.onText(/\/start/, async (payload: TelegramBot.Message) => {
    try {
        const chat = payload.chat
        const options: TelegramBot.SendMessageOptions = {
            reply_markup: {
                keyboard: [[{ text: '📱 Поділитись номером', request_contact: true }]],
                resize_keyboard: true,
                one_time_keyboard: true
            }
        }
        await TelegramService.sendMessage(chat.id, 'Привіт, цей бот буде відсилати актуальну інформацію про спільноту та твої служіння, для того щоб почати потрібно поділитися номером телефону', options)
    } catch (err) {
        console.error('ERROR /start HANDLER', err)
    }
})

// Contact shared handler
GNBot.on('contact', async (payload: TelegramBot.Message) => {
    try {
        const contact = payload.contact!
        const chat = payload.chat
        const from = payload.from!

        let planningCenterId: string | undefined
        try {
            const pcResult = await PlanningCenterService.searchPersonByPhone(contact.phone_number)
            const phoneRecords: any[] = pcResult.data?.data ?? []
            if (phoneRecords.length) {
                planningCenterId = phoneRecords[0].relationships?.person?.data?.id
            }
        } catch (err) {
            console.error('PC phone search error', err)
        }

        await TelegramUserService.updateOne(
            { userId: String(from.id) },
            {
                $set: {
                    userId: String(from.id),
                    telegramPhone: contact.phone_number,
                    lastMessageAt: new Date(),
                    ...(planningCenterId ? { planningCenterId } : {})
                }
            },
            { upsert: true }
        )

        const replyText = planningCenterId
            ? 'Номер збережено, також зберіг тебе в Planning Center ✅'
            : 'Номер збережено, але не знайшов тебе в Planning Center'

        await TelegramService.sendMessage(chat.id, replyText, {
            reply_markup: { remove_keyboard: true }
        })
    } catch (err) {
        console.error('ERROR CONTACT HANDLER', err)
    }
})

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

// /unsubscribe_commands — remove all scheduled reminders for this chat
GNBot.onText(/\/unsubscribe_commands/, async (payload: TelegramBot.Message) => {
    try {
        const chat = payload.chat
        const threadId = payload.message_thread_id
        const result = await ScheduleEventsService.deleteMany({ chatId: String(chat.id) })
        const message = result.deletedCount > 0
            ? `Скасовано ${result.deletedCount} нагадування(-ь) ✅`
            : 'Активних нагадувань не знайдено'
        await TelegramService.sendMessage(chat.id, message, {
            ...(threadId ? { message_thread_id: threadId } : {})
        })
    } catch (err) {
        console.error('ERROR /unsubscribe_commands HANDLER', err)
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
00:00 - Молитва за дітей
00:00 - Молитва за Україну / Потреби
00:00 - Слово за пожертви
00:00 - Привітання тих, хто вперше
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

// Handles decline reason text after user pressed Ні ❌
GNBot.on('message', async (payload: TelegramBot.Message) => {
    try {
        if (!payload.text || payload.text.startsWith('/')) return
        if (payload.chat.type !== 'private') return
        const chat = payload.chat
        const userId = String(payload.from?.id ?? chat.id)
        const telegramUser = await TelegramUserService.getOne({ userId })
        const pending = telegramUser?.pendingDecline
        if (!pending) return

        const { planPersonId, planId, serviceTypeId, messageId } = pending

        await PlanningCenterService.updatePlanPersonStatus(serviceTypeId, planId, planPersonId, 'D', payload.text)
        await TelegramUserService.updateOne({ userId }, { $unset: { pendingDecline: 1 } })

        const detailsLine = (pending.position && pending.date)
            ? `\n${pending.serviceName ? pending.serviceName + ' ' : ''}${pending.date} на позиції ${pending.position}`
            : ''

        await TelegramService.sendMessage(chat.id, `Зрозуміло, відмінено ❌${detailsLine}\nПричина: ${payload.text}`, {
            reply_markup: {
                inline_keyboard: [[
                    { text: 'Змінити', callback_data: `PCRSVP:CHANGE:${planPersonId}:${planId}:${serviceTypeId}` }
                ]]
            }
        })
    } catch (err) {
        console.error('PCRSVP decline reason error', err)
        if (payload.from?.id) {
            await TelegramService.sendMessage(payload.from.id, 'Сталася помилка, спробуйте надіслати причину ще раз.').catch(() => {})
        }
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

        // RSVP response for Planning Center plan assignments
        if (messageText.startsWith('PCRSVP:')) {
            const [, status, planPersonId, planId, serviceTypeId] = messageText.split(':') as [string, 'C' | 'D' | 'CHANGE', string, string, string]

            const getPlanDetails = async () => {
                const [teamRes, planRes] = await Promise.all([
                    PlanningCenterService.getPlanTeamMembers(serviceTypeId, planId),
                    PlanningCenterService.getPlan(serviceTypeId, planId)
                ])
                const planPerson = (teamRes.data?.data ?? []).find((p: any) => p.id === planPersonId)
                const plan = planRes.data?.data
                const serviceType = (planRes.data?.included ?? []).find((i: any) => i.type === 'ServiceType')
                if (!planPerson || !plan) return null
                return {
                    position: planPerson.attributes?.team_position_name ?? '—',
                    date: moment(plan.attributes?.sort_date).format('DD.MM.YYYY'),
                    serviceName: serviceType?.attributes?.name ?? ''
                }
            }

            const formatDetailsLine = (d: { serviceName: string, date: string, position: string } | null) =>
                d ? `\n${d.serviceName} ${d.date} на позиції ${d.position}` : ''

            if (status === 'CHANGE') {
                try {
                    let originalText = 'Просимо підтвердити чи ти будеш на служінні:'
                    const details = await getPlanDetails()
                    if (details) {
                        originalText = `${details.serviceName} ${details.date} на позиції ${details.position}. Просимо підтвердити чи ти точно будеш натискаючи кнопки снизу.`
                    }
                    await TelegramService.editMessage(originalText, {
                        chat_id: chat.id,
                        message_id: messageId,
                        reply_markup: {
                            inline_keyboard: [[
                                { text: 'Так ✅', callback_data: `PCRSVP:C:${planPersonId}:${planId}:${serviceTypeId}` },
                                { text: 'Ні ❌',  callback_data: `PCRSVP:D:${planPersonId}:${planId}:${serviceTypeId}` }
                            ]]
                        }
                    })
                } catch (err) {
                    console.error('PCRSVP CHANGE error', err)
                    await TelegramService.editMessage('Сталася помилка, спробуйте пізніше.', { chat_id: chat.id, message_id: messageId })
                }
                GNBot.answerCallbackQuery(payload.id)
                return
            }

            if (status === 'D') {
                const userId = String(payload.from?.id ?? chat.id)
                try {
                    const details = await getPlanDetails()
                    await TelegramUserService.updateOne(
                        { userId },
                        { $set: { pendingDecline: {
                            planPersonId, planId, serviceTypeId, messageId, createdAt: new Date(),
                            ...(details ? { position: details.position, date: details.date, serviceName: details.serviceName } : {})
                        }}},
                        { upsert: true }
                    )
                    await TelegramService.editMessage('Будь ласка напишіть причину, і тоді ми відмінимо вашу позицію', {
                        chat_id: chat.id,
                        message_id: messageId
                    })
                } catch (err) {
                    console.error('PCRSVP decline reason prompt error', err)
                    await TelegramUserService.updateOne({ userId }, { $unset: { pendingDecline: 1 } })
                    await TelegramService.editMessage('Сталася помилка, спробуйте пізніше.', { chat_id: chat.id, message_id: messageId })
                }
                GNBot.answerCallbackQuery(payload.id)
                return
            }

            // status === 'C'
            try {
                await PlanningCenterService.updatePlanPersonStatus(serviceTypeId, planId, planPersonId, status)
                const details = await getPlanDetails()
                const detailsLine = formatDetailsLine(details)
                await TelegramService.editMessage(`Дякуємо! Підтверджено ✅${detailsLine}`, {
                    chat_id: chat.id,
                    message_id: messageId,
                    reply_markup: {
                        inline_keyboard: [[
                            { text: 'Змінити', callback_data: `PCRSVP:CHANGE:${planPersonId}:${planId}:${serviceTypeId}` }
                        ]]
                    }
                })
            } catch (err) {
                console.error('PCRSVP update error', err)
                await TelegramService.editMessage('Сталася помилка, спробуйте пізніше.', { chat_id: chat.id, message_id: messageId })
            }
            GNBot.answerCallbackQuery(payload.id)
            return
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