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

let maxCrewmateCount = 19
let maxImposterCount = 0
let waitingForCrewmateCount = {}
let waitingForImposterCount = {}

let FOUND_BODY = false;

let playersList = []

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
                                    ['🎮 Початок гри 🎮'],
                                ],
                                resize_keyboard: true,
                                one_time_keyboard: true, 
                            },
                        });
                    
                        return { data: false };
                    }
                    case '/leave': {
                        if (playersList.find(p => p.chat_id === chat.id)) {
                            playersList = playersList.filter(p => p.chat_id !== chat.id);

                            await TelegramService.sendMessage({
                                chatId: chat.id,
                                message: 'Окей, тебе видалено зі списку гравців',
                                reply_markup: {
                                    keyboard: [
                                        ['🎮 Початок гри 🎮'],
                                    ],
                                    resize_keyboard: true,
                                    one_time_keyboard: true, 
                                },
                            });
                            
                            await TelegramService.sendMessage({
                                chatId: adminChatId,
                                message: `${chat.first_name}, leaved the game \ncurrent players list: \n${playersList.length ? playersList.map(p => `\n ${p.name}, ${p.username}`) : 'EMPTY'}\ntotal count - ${playersList.length}`
                            });
                            console.log(playersList)
                        } else {
                            await TelegramService.sendMessage({
                                chatId: chat.id,
                                message: 'Відома помилка',
                                reply_markup: {
                                    keyboard: [
                                        ['🎮 Початок гри 🎮'],
                                    ],
                                    resize_keyboard: true,
                                    one_time_keyboard: true, 
                                },
                            });
                        }
                    
                        return { data: false };
                    }

                    case '🎮 Початок гри 🎮': {
                        let user = { name: payload?.message?.chat.first_name, username: '@'+from.username, chat_id: payload?.message?.chat.id, role: null }
                        if (playersList.length < (maxCrewmateCount + maxImposterCount) || playersList.find(p => p.chat_id === user.chat_id)) {
                            if (!playersList.find(p => p.chat_id === user.chat_id)) {
                                playersList.push(user)
                                await TelegramService.sendMessage({
                                    chatId: chat.id,
                                    message: `Вітаю, ${chat.first_name} \nчекаємо інших гравців \nскоро ти дізнаєшся свою роль`,
                                    reply_markup: {
                                        keyboard: [
                                            ['💅 Не буду грати 💅'],
                                        ],
                                        resize_keyboard: true,
                                        one_time_keyboard: true, 
                                    },
                                });
                                await TelegramService.sendMessage({
                                    chatId: adminChatId, 
                                    message: `${chat.first_name}, joined to game, \ncurrent players list:\n${playersList.length ? playersList.map(p => `\n - ${p.name} ${p.username}`) : '\nEMPTY'}\n\ntotal count - ${playersList.length}`,reply_markup: {
                                        keyboard: [
                                            [{text: 'Give the roles 🎲'}], 
                                            [{text: '🎮 Початок гри 🎮'}, {text: '💅 Не буду грати 💅'}],
                                            [{text: '🚨 Знайдено тіло 🚨'}],
                                            [{text: `Crew: ${maxCrewmateCount} Imps: ${maxImposterCount}`}, {text: 'Change count'}],
                                            [{text: 'End the Game 🧩'}],
                                        ],
                                        resize_keyboard: true,
                                        one_time_keyboard: false, 
                                    },
                                });                            
                                console.log(playersList)
                                return { data: false }    
                            } else {
                                await TelegramService.sendMessage({
                                    chatId: chat.id,
                                    message: `${chat.first_name}, ти вже береш участь !`,
                                    reply_markup: {
                                        keyboard: [
                                            ['💅 Не буду грати 💅'],
                                        ],
                                        resize_keyboard: true,
                                        one_time_keyboard: true, 
                                    },
                                });
                            }
                        } else {
                            await TelegramService.sendMessage({
                                chatId: chat.id,
                                message: 'От халепа, всі місця зайняті, доведеться чекати наступну гру...',
                                reply_markup: {
                                    keyboard: [
                                        ['🎮 Початок гри 🎮'],
                                    ],
                                    resize_keyboard: true,
                                    one_time_keyboard: true, 
                                },
                            });
                        
                        }
                        return { data: false }; 
                    }

                    case '💅 Не буду грати 💅': {
                        if (playersList.find(p => p.chat_id === chat.id)) {
                            playersList = playersList.filter(p => p.chat_id !== chat.id);

                            await TelegramService.sendMessage({
                                chatId: chat.id,
                                message: 'Окей, тебе видалено зі списку гравців',
                                reply_markup: {
                                    keyboard: [
                                        ['🎮 Початок гри 🎮'],
                                    ],
                                    resize_keyboard: true,
                                    one_time_keyboard: true, 
                                },
                            });
                            
                            await TelegramService.sendMessage({
                                chatId: adminChatId,
                                message: `${chat.first_name}, leaved the game \ncurrent players list: \n${playersList.length ? playersList.map(p => `\n ${p.name}, ${p.username}`) : 'EMPTY'}\ntotal count - ${playersList.length}`
                            });
                            console.log(playersList)
                        } else {
                            await TelegramService.sendMessage({
                                chatId: chat.id,
                                message: 'Відома помилка',
                                reply_markup: {
                                    keyboard: [
                                        ['🎮 Початок гри 🎮'],
                                    ],
                                    resize_keyboard: true,
                                    one_time_keyboard: true, 
                                },
                            });
                        }
                        
                        return { data: false };
                    }
                    
                    case '🚨 Знайдено тіло 🚨': {
                        
                        if (FOUND_BODY === false) {
                            const presentationId = (await ProPresenterService.getActivePresentation())?.data?.presentation?.id?.uuid
                            await ProPresenterService.trgSpecSlide(presentationId, 1)
                            // await setTimeout(() => ProPresenterService.trgSpecSlide(presentationId, 0), 45 * 1000)
                            
                            for (let player of playersList) {
                                await TelegramService.sendMessage({
                                    chatId: player.chat_id, 
                                    message: `${chat.first_name} знайшов(ла) тіло, \nу вас 45 секунд щоб прийти на місце обговорення \nвідлік почався, ви гусі...`, 
                                })

                                // let i = 45;
                                // let interval = setInterval(() => {
                                //     TelegramService.sendMessage({ chatId: player.chat_id, message: `Залишилось ${i} секунд` });
                                //     i-=1; 
                                // }, 1000);
                                
                                // setTimeout(() => {
                                //     clearInterval(interval); 
                                // }, 45 * 1000);
                                
                                // await TelegramService.sendMessage({
                                //     chatId: player.chat_id, 
                                //     message: `${chat.first_name} знайшов(ла) тіло, \nу вас 45 секунд щоб прийти на місце обговорення \nвідлік почався...`, 
                                // })
                                setTimeout(() => TelegramService.sendMessage({chatId: player.chat_id, message: `Час вийшов`}), 45 * 1000)
                            }
                            FOUND_BODY = true
                        }
                        
                        setTimeout(() => FOUND_BODY = false, 4 * 1000)
                        return { data: false }
                    }
                    
                    case '/lolkekadminpanel': {
                        await TelegramService.sendMessage({
                            chatId: adminChatId,
                            message: 'Welcome home sir.',
                            reply_markup: {
                                keyboard: [
                                    [{text: 'Give the roles 🎲'}], 
                                    [{text: '🎮 Початок гри 🎮'}, {text: '💅 Не буду грати 💅'}],
                                    [{text: '🚨 Знайдено тіло 🚨'}],
                                    [{text: `Crew: ${maxCrewmateCount} Imps: ${maxImposterCount}`}, {text: 'Change count'}],
                                    [{text: 'End the Game 🧩'}],
                                ],
                                resize_keyboard: true,
                                one_time_keyboard: false, 
                            },
                        });
                        
                        return { data: false }
                    }

                    case 'Change count' : {
                        await TelegramService.sendMessage({
                            chatId: adminChatId,
                            message: 'Which count you want to change ?',
                            reply_markup: {
                                keyboard: [
                                    [{text: `C: ${maxCrewmateCount} I: ${maxImposterCount}`}],
                                    [{text: 'Crewmate count'}, {text: 'Imposter count'}], 
                                    [{text: 'Main menu ↩️'}],
                                ],
                                resize_keyboard: true,
                                one_time_keyboard: false, 
                            },
                        });

                        return { data: false };
                    }

                    case 'Crewmate count' : {
                        await TelegramService.sendMessage({
                            chatId: adminChatId,
                            message: 'Send new count of crewmates ⬇️',
                        });

                        waitingForCrewmateCount[adminChatId] = true; // Устанавливаем ожидание
                        return { data: false };
                    }

                    case 'Imposter count' : {
                        await TelegramService.sendMessage({
                            chatId: adminChatId,
                            message: 'Send new count of imposters ⬇️',
                        });

                        waitingForImposterCount[adminChatId] = true; // Устанавливаем ожидание
                        return { data: false };
                    }

                    case 'Main menu ↩️' : {
                        await TelegramService.sendMessage({
                            chatId: adminChatId,
                            message: 'Welcome to admin menu.',
                            reply_markup: {
                                keyboard: [
                                    [{text: 'Give the roles 🎲'}], 
                                    [{text: '🎮 Початок гри 🎮'}, {text: '💅 Не буду грати 💅'}],
                                    [{text: '🚨 Знайдено тіло 🚨'}],
                                    [{text: `Crew: ${maxCrewmateCount} Imps: ${maxImposterCount}`}, {text: 'Change count'}],
                                    [{text: 'End the Game 🧩'}],
                                ],
                                resize_keyboard: true,
                                one_time_keyboard: false, 
                            },
                        });

                        return { data: false };
                    }
                    
                    
                    case 'Give the roles 🎲': {
                        if (playersList.length < (maxCrewmateCount + maxImposterCount)) {
                            await TelegramService.sendMessage({chatId: adminChatId, message: `Not enough players. \ncurrent count - ${playersList.length}\nneed - ${(maxCrewmateCount + maxImposterCount)}`})
                            return {data: false}
                        }
                        function shuffleArray(array) {
                            for (let i = array.length - 1; i > 0; i--) {
                                const j = Math.floor(Math.random() * (i + 1));
                                [array[i], array[j]] = [array[j], array[i]];
                            }
                            return array;
                        }

                        function assignRoles(playersList, numImposters = maxImposterCount) {
                            let roles = Array(playersList.length - numImposters).fill('Мирний');
                            roles = roles.concat(Array(numImposters).fill('Зрадник'));
                            roles = shuffleArray(roles);
                        
                            const playerRoles = {};
                            playersList.forEach((player, index) => {
                                player.role = roles[index];
                                console.log(player)
                            });
                        
                            return playerRoles;
                        }
                        let result = await assignRoles(playersList)
                        console.log(result)
                        
                        
                        
                        let impostersList = []
                        for (let player of playersList) {
                            player.name = escapeMarkdownV2(player.name)
                            console.log(player)
                            await TelegramService.sendMessage({
                                chatId: player.chat_id, 
                                message: `${player.name}, в цій грі твоя роль \\-\\ ||${player.role}||`, 
                                parseMode: 'MarkdownV2',
                                reply_markup: {
                                    keyboard: [
                                        ['🚨 Знайдено тіло 🚨'],
                                    ],
                                    resize_keyboard: true,
                                    one_time_keyboard: false, 
                                },
                            })

                            if (player.role === 'Зрадник') {
                                impostersList.push(player.name)
                                console.log(impostersList)
                            }
                        }

                        await TelegramService.sendMessage({
                            chatId: adminChatId, 
                            message: `Imposters List \\-\\ ||${impostersList.map(name => name).join(', ')}||`,
                            parseMode: 'MarkdownV2'
                        })
                        

                        return { data: false }
                    }

                    case 'End the Game 🧩': {
                        for (let player of playersList) {
                            await TelegramService.sendMessage({
                                chatId: player.chat_id,
                                message: 'Гру завершено, зіграти ще раз ?',
                                reply_markup: {
                                    keyboard: [
                                        ['🎮 Початок гри 🎮'],
                                    ],
                                    resize_keyboard: true,
                                    one_time_keyboard: true, 
                                },
                            });
                        }
                        await TelegramService.sendMessage({
                            chatId: adminChatId, 
                            message: `Players list was cleared,\nyou can start the new game`, 
                            reply_markup: {
                                keyboard: [
                                    [{text: 'Give the roles 🎲'}], 
                                    [{text: '🎮 Початок гри 🎮'}, {text: '💅 Не буду грати 💅'}],
                                    [{text: '🚨 Знайдено тіло 🚨'}],
                                    [{text: `Crew: ${maxCrewmateCount} Imps: ${maxImposterCount}`}, {text: 'Change count'}],
                                    [{text: 'End the Game 🧩'}],
                                ],
                                resize_keyboard: true,
                                one_time_keyboard: false, 
                            },
                        })
                        playersList = []

                        return { data: false }
                    }


                    
                    // case '/reminder': {
                    //     const availableScheduledTypesForSend = [
                    //         Object.entries(constants.ScheduleServiceTypesHuman).map(([key, name]) => ({text: name, callback_data: key}))
                    //     ]
                    //     let payload = {
                    //         chatId: chat.id,
                    //         message: `Вибери тип нагадування`,
                    //         buttons: availableScheduledTypesForSend
                    //     }
                    //     if(threadId){
                    //         payload['messageThreadId'] = threadId
                    //     }
                    //     await TelegramService.sendInlineMenuButtons(payload)
                    //     return { data: true }
                    // }
                    // case '/live': {

                    //     const axios = require('axios');
                    //     const QUERY = 'goodnewssmila';

                    //     async function getChannelId(query) {
                    //         const url ='https://www.googleapis.com/youtube/v3/search';

                    //         try {
                    //           const response = await axios.get(url, {
                    //             params: {
                    //               part: 'snippet',
                    //               q: query, // Поиск по никнейму канала
                    //               type: 'channel',
                    //               maxResults: 1,
                    //               key: GOOGLE_API_KEY,
                    //             },
                    //           });
                          
                    //           if (response.data.items.length > 0) {
                    //             const channel = response.data.items[0];
                    //             const channelId = channel.id.channelId;
                    //             console.log(`Channel ID: ${channelId}`);
                    //             return channelId;
                    //           } else {
                    //             console.log('Канал не найден.');
                    //             return null;
                    //           }
                    //         } catch (error) {
                    //           console.error('Ошибка при поиске канала:', error.message);
                    //           return null;
                    //         }
                    //     }

                    //     async function getLatestVideo(channelId) {
                    //         const url = 'https://www.googleapis.com/youtube/v3/search';

                    //         try {
                    //             const response = await axios.get(url, {
                    //                 params: {
                    //                     part: 'snippet',
                    //                     channelId: channelId,
                    //                     order: 'date',
                    //                     maxResults: 1,
                    //                     type: 'video',
                    //                     key: GOOGLE_API_KEY,
                    //                 },
                    //             });

                    //             if (response.data.items.length > 0) {
                    //                 const video = response.data.items[0];
                    //                 const videoId = video.id.videoId;
                    //                 const videoTitle = video.snippet.title;
                    //                 const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

                    //                 console.log(`Latest Video Title: ${videoTitle}`);
                    //                 console.log(`Video URL: ${videoUrl}`);
                    //                 await TelegramService.sendMessage({chatId: chat.id, message: `${videoUrl}`})
                    //             } else {
                    //                 console.log('No videos found on the channel.');
                    //             }
                    //         } catch (error) {
                    //             console.error('Error fetching the latest video:', error.message);
                    //         }
                    //     }

                    //     async function getLiveStream(CHANNEL_ID) {
                    //         const url = 'https://www.googleapis.com/youtube/v3/search';
                          
                    //         try {
                    //           const response = await axios.get(url, {
                    //             params: {
                    //               part: 'snippet',
                    //               channelId: CHANNEL_ID,
                    //               eventType: 'live', // searching livestram only
                    //               type: 'video',     // video type only
                    //               maxResults: 1,     // single result
                    //               key: 'AIzaSyC9QPeYOW_BelCIqVrZXwLrDFzOPIEs0k4',
                    //             },
                    //           });
                          
                    //           if (response.data.items.length > 0) {
                    //             const liveVideo = response.data.items[0];
                    //             const videoId = liveVideo.id.videoId;
                    //             const videoTitle = liveVideo.snippet.title;
                    //             const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
                          
                    //             console.log(`Live Stream Title: ${videoTitle}`);
                    //             console.log(`Live Stream URL: ${videoUrl}`);
                    //             await TelegramService.sendMessage({chatId: chat.id, message:`${videoUrl}`})
                    //             return videoUrl;
                    //           } else {
                    //             console.log('Нет активных трансляций на канале.');
                    //             await TelegramService.sendMessage({chatId: chat.id, message: `Трансляції зараз немає, можу запропонувати останнє відео на каналі`})
                    //             await getLatestVideo(CHANNEL_ID);
                    //             return null;
                    //           }
                    //         } catch (error) {
                    //           console.error('Ошибка при поиске лайвстрима:', error.message);
                    //           return null;
                    //         }
                    //     }

                    //     async function main() {
                    //         const channelId = await getChannelId(QUERY);
                    //         if (channelId) await getLiveStream(channelId);
                    //     }

                    //     await main();

                    //     // await TelegramService.sendMessage(chat.id,`Добренько!`)
                    //     return { data: true }
                    // }
                    // case '/ppNext': {
                    //     await ProPresenterService.slideNext()

                    //     await TelegramService.sendMessage({chatId: chat.id, message: `Next slide`})
                    //     return { data: true }
                    // }
                    // case '/ppPrev': {
                    //     await ProPresenterService.slidePrev()

                    //     await TelegramService.sendMessage({chatId: chat.id, message: `Prev slide`})
                    //     return { data: true }
                    // }

                    default: {
                        if (waitingForCrewmateCount[adminChatId]) {
                            const playerCount = parseInt(commandText, 10);
                    
                            if (playerCount >= 0) {
                                maxCrewmateCount = playerCount

                                await TelegramService.sendMessage({
                                    chatId: adminChatId,
                                    message: `Crew count set to: ${playerCount}`,
                                    reply_markup: {
                                        keyboard: [
                                            [{text: `C: ${maxCrewmateCount} I: ${maxImposterCount}`}],
                                            [{text: 'Crewmate count'}, {text: 'Imposter count'}], 
                                            [{text: 'Main menu ↩️'}],
                                        ],
                                        resize_keyboard: true,
                                        one_time_keyboard: false, 
                                    },
                                });
                                await TelegramService.sendMessage({
                                    chatId: adminChatId,
                                    message: `Current game config: \n - total player count ${maxCrewmateCount + maxImposterCount}\n - crewmate ${maxCrewmateCount} \n - imposters ${maxImposterCount}`,
                                });
                                waitingForCrewmateCount[adminChatId] = false; 
                            } else {
                                await TelegramService.sendMessage({
                                    chatId: adminChatId,
                                    message: 'Invalid input. Please send a positive number.',
                                });
                            }
                    
                            return { data: false };
                        }

                        if (waitingForImposterCount[adminChatId]) {
                            const imposterCount = parseInt(commandText, 10);
                    
                            if (imposterCount >= 0) {
                                maxImposterCount = imposterCount

                                await TelegramService.sendMessage({
                                    chatId: adminChatId,
                                    message: `Imposter count set to: ${maxImposterCount}`,                                    
                                    reply_markup: {
                                        keyboard: [
                                            [{text: `C: ${maxCrewmateCount} I: ${maxImposterCount}`}],
                                            [{text: 'Crewmate count'}, {text: 'Imposter count'}], 
                                            [{text: 'Main menu ↩️'}],
                                        ],
                                        resize_keyboard: true,
                                        one_time_keyboard: false, 
                                    },
                                });
                                await TelegramService.sendMessage({
                                    chatId: adminChatId,
                                    message: `Current game config: \n - total player count ${maxCrewmateCount + maxImposterCount}\n - crewmate ${maxCrewmateCount} \n - imposters ${maxImposterCount}`,
                                });
                                waitingForImposterCount[adminChatId] = false; 
                            } else {
                                await TelegramService.sendMessage({
                                    chatId: adminChatId,
                                    message: 'Invalid input. Please send a positive number.',
                                });
                            }
                    
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
