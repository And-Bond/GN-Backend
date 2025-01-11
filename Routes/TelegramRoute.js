const TelegramService = require('../Services/TelegramService')
const TelegramUserService = require('../Services/TelegramUserService')
const PlanningCenterService = require('../Services/PlanningCenterService')
const ScheduleEventsService = require('../Services/ScheduleEventsService')
const constants = require('../Other/constants')
const moment = require('moment')
const ProPresenterService = require('../Services/ProPresenterService')
const dotenv = require('dotenv');
dotenv.config()
const { GOOGLE_API_KEY } = process.env

let waitingMessageForAdmin = {}
let waitingStageMessage = {}
let stageMode = {}

let adminChatId = '695680789'
function escapeMarkdownV2(str) {
    return str.replace(/([_*[\]()~`>#+-=|{}.!])/g, '\\$1');
}

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
                let messageId;
                let { payload } = req

                // Skip this actions
                if(payload.edited_message){
                    return { data: true }
                }
                // Inline command
                if(payload?.message){
                    commandText = payload?.message?.text
                    chat = payload?.message?.chat
                    from = payload?.message?.from
                    messageId = payload?.message?.message_id 
                    threadId = payload?.message?.message_thread_id
                }
                // Command through buttons
                if(payload?.callback_query){
                    commandText = payload.callback_query.data
                    from = payload?.callback_query?.from
                    chat = payload?.callback_query?.message?.chat
                    messageId = payload?.callback_query?.message?.message_id 
                    threadId = payload?.callback_query?.message?.message_thread_id 
                }
                if(!chat){
                    console.error('Invalid chat variable!',payload)
                    return 'Не можу знайти потрібні дані, вибачте('
                }
                // If command was sent from group we trim it because it will start with bot name
                if(['group','supergroup'].includes(chat.type) && commandText?.includes(constants.BotName)){
                    commandText = commandText.replaceAll(constants.BotName,'')
                }
                // We can't define command text, ignore
                if(!commandText){
                    return 'Вибачте, але я не розумію, що ви від мене хочете('
                }
                switch(commandText){
                    case '/start': {
                        await TelegramService.sendMessage({
                            chatId: chat.id,
                            message: 'Привіт',
                            reply_markup: {
                                keyboard: [
                                    ['Написати Адміну'],
                                ],
                                resize_keyboard: true,
                                one_time_keyboard: true, 
                            },
                        });

                    
                        return { data: false };
                    }
                    
                    case 'Написати Адміну': {
                        await TelegramService.sendMessage({
                            chatId: chat.id,
                            message: 'Відправ повідомлення в цей чат',
                        });

                        waitingMessageForAdmin[chat.id] = true
                    
                        return { data: false };
                    }

                    case '/stage_mode_on': {
                        await TelegramService.sendMessage({
                            chatId: chat.id,
                            message: 'Stage Mode turned on: \nAll next messages will be displayed on Stage Screen',
                        });

                        stageMode[chat.id] = true
                    
                        return { data: false };
                    }
                    
                    case '/stage_mode_off': {
                        await TelegramService.sendMessage({
                            chatId: chat.id,
                            message: 'Stage mode turned off',
                        });

                        stageMode[chat.id] = false
                    
                        return { data: false };
                    }

                    case '/pp_control': {
                        await TelegramService.sendMessage({
                            chatId: chat.id,
                            message: 'ProPresenter Control Mode',
                            reply_markup: {
                                keyboard: [
                                    [{ text: 'Prev Slide' }, { text: 'Next Slide' }],
                                    [{ text: 'By Content' }],
                                    [{ text: 'Show Stage Message' }]
                                ],
                                one_time_keyboard: false, 
                            }
                        });                        
                    
                        return { data: false };
                    }                     

                    case 'Prev Slide': {
                        await ProPresenterService.slidePrev()
                        await TelegramService.sendMessage({
                            chatId: chat.id, 
                            message: 'Prev Slide Clicked'
                        })

                        return { data: false };
                    }                     

                    case 'Next Slide': {
                        await ProPresenterService.slideNext()
                        await TelegramService.sendMessage({
                            chatId: chat.id, 
                            message: 'Next Slide Clicked'
                        })

                        return { data: false };
                    }
                    
                    case 'By Content': {
                        let currentGroups = (await ProPresenterService.getActivePresentation())?.data?.presentation?.groups
                        currentGroups = currentGroups.map(group => ({text: group.name, callback_data: (group.name.toLowerCase()).split(' ').join('_')}))
                        await TelegramService.sendMessage({
                            chatId: chat.id, 
                            message: 'There is groups of current active presentation ⬇️',
                            reply_markup: {
                                inline_keyboard: [
                                    [...currentGroups],
                                ],
                                one_time_keyboard: false, 
                            }
                        })

                        return {data: false};
                    }
                    
                    case 'Show Stage Message': {
                        await TelegramService.sendMessage({
                            chatId: chat.id, 
                            message: 'Write and send message here ⬇️',
                        })
                        
                        waitingStageMessage[chat.id] = true

                        return {data: false};
                    }


                    default: {

                        if (stageMode[chat.id]) {
                            await ProPresenterService.createStageMessage(commandText)
                            await TelegramService.sendMessage({
                                chatId: chat.id,
                                message: '✅ Message was displayed'
                            });
                            setTimeout(() => {
                                ProPresenterService.hideStageMessage()
                            }, 2000)
                            return { data: false };
                        }
                        
                        if (waitingMessageForAdmin[chat.id]) {
                            await TelegramService.sendMessage({
                                chatId: adminChatId,
                                message: `[${from.first_name}](https://t.me/@${escapeMarkdownV2(from.username)}): ` + commandText,
                                parseMode: 'MarkdownV2'
                            });
                            waitingMessageForAdmin[chat.id] = false; 

                            return { data: false };
                        }

                        if (waitingStageMessage[chat.id]) {
                            await ProPresenterService.createStageMessage(commandText)
                            await TelegramService.sendMessage({
                                chatId: chat.id,
                                message: '✅ Message was displayed'
                            });
                            
                            setTimeout(() => {
                                ProPresenterService.hideStageMessage()
                            }, 10000)

                            waitingStageMessage[chat.id] = false; 

                            return { data: false };
                        }
                    
                        for (const key in constants.ScheduleServiceTypesHuman) {
                            // Check if it some schedule events type setting
                            if(key === commandText){
                                let query = {
                                    chatId: chat.id,
                                    type: key,
                                }
                                if(threadId){
                                    query['threadId'] = threadId
                                }
                                const isExists = await ScheduleEventsService.getOne(query)
                                let payload = {
                                    chatId: chat.id,
                                    messageId: messageId
                                }
                                if(threadId){
                                    payload['messageThreadId'] = threadId
                                }
                                if(key === constants.ScheduleServiceTypesCode.SUNDAY_SERVICE_REMINDER){
                                    // Hard code every thursday
                                    const nextDate = moment().utc().startOf('hour').isoWeekday(4).set({hour: 15, minute: 0})
                                    if(moment().utc().isAfter(nextDate)){
                                        nextDate.add(1,'week')
                                    }
                                    payload['message'] = `Добре! Наступного разу нагадування спрацює ${moment(isExists?.nextSendAt || nextDate).utcOffset('+02:00').format('DD/MM HH:mm')}`
                                    if(!isExists){
                                        await ScheduleEventsService.create({
                                            chatId: chat.id,
                                            nextSendAt: nextDate.toDate(),
                                            type: key,
                                            threadId: threadId
                                        })
                                    }
                                }
                                if(key === constants.ScheduleServiceTypesCode.SUNDEY_SERVICE_START_TIMER_REMINDER){
                                    payload['message'] = `Добре! Нагадування спрацює, як тільки <b>Початок Відліку</b> буде активовано`
                                    payload['parseMode'] = 'HTML'
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

                                await TelegramService.editMessage(payload)
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
