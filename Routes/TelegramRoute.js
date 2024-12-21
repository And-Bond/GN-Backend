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
                }
                // Command through buttons
                if(payload?.callback_query){
                    commandText = payload.callback_query.data
                    from = payload?.callback_query?.from
                    chat = payload?.callback_query?.message?.chat
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
                        await TelegramService.sendInlineMenuButtons(chat.id,'Вибери тип нагадування',availableScheduledTypesForSend)
                        return { data: true }
                    }
                    case '/live': {

                        const axios = require('axios');
                        const QUERY = 'goodnewssmila';

                        async function getChannelId(query) {
                            const url ='https://www.googleapis.com/youtube/v3/search';

                            try {
                              const response = await axios.get(url, {
                                params: {
                                  part: 'snippet',
                                  q: query, // Поиск по никнейму канала
                                  type: 'channel',
                                  maxResults: 1,
                                  key: GOOGLE_API_KEY,
                                },
                              });
                          
                              if (response.data.items.length > 0) {
                                const channel = response.data.items[0];
                                const channelId = channel.id.channelId;
                                console.log(`Channel ID: ${channelId}`);
                                return channelId;
                              } else {
                                console.log('Канал не найден.');
                                return null;
                              }
                            } catch (error) {
                              console.error('Ошибка при поиске канала:', error.message);
                              return null;
                            }
                        }

                        async function getLatestVideo(channelId) {
                            const url = 'https://www.googleapis.com/youtube/v3/search';

                            try {
                                const response = await axios.get(url, {
                                    params: {
                                        part: 'snippet',
                                        channelId: channelId,
                                        order: 'date',
                                        maxResults: 1,
                                        type: 'video',
                                        key: GOOGLE_API_KEY,
                                    },
                                });

                                if (response.data.items.length > 0) {
                                    const video = response.data.items[0];
                                    const videoId = video.id.videoId;
                                    const videoTitle = video.snippet.title;
                                    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

                                    console.log(`Latest Video Title: ${videoTitle}`);
                                    console.log(`Video URL: ${videoUrl}`);
                                    await TelegramService.sendMessage(chat.id,`${videoUrl}`)
                                } else {
                                    console.log('No videos found on the channel.');
                                }
                            } catch (error) {
                                console.error('Error fetching the latest video:', error.message);
                            }
                        }

                        async function getLiveStream(CHANNEL_ID) {
                            const url = 'https://www.googleapis.com/youtube/v3/search';
                          
                            try {
                              const response = await axios.get(url, {
                                params: {
                                  part: 'snippet',
                                  channelId: CHANNEL_ID,
                                  eventType: 'live', // searching livestram only
                                  type: 'video',     // video type only
                                  maxResults: 1,     // single result
                                  key: 'AIzaSyC9QPeYOW_BelCIqVrZXwLrDFzOPIEs0k4',
                                },
                              });
                          
                              if (response.data.items.length > 0) {
                                const liveVideo = response.data.items[0];
                                const videoId = liveVideo.id.videoId;
                                const videoTitle = liveVideo.snippet.title;
                                const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
                          
                                console.log(`Live Stream Title: ${videoTitle}`);
                                console.log(`Live Stream URL: ${videoUrl}`);
                                await TelegramService.sendMessage(chat.id,`${videoUrl}`)
                                return videoUrl;
                              } else {
                                console.log('Нет активных трансляций на канале.');
                                await TelegramService.sendMessage(chat.id,`Трансляції зараз немає, можу запропонувати останнє відео на каналі`)
                                await getLatestVideo(CHANNEL_ID);
                                return null;
                              }
                            } catch (error) {
                              console.error('Ошибка при поиске лайвстрима:', error.message);
                              return null;
                            }
                        }

                        async function main() {
                            const channelId = await getChannelId(QUERY);
                            if (channelId) await getLiveStream(channelId);
                        }

                        await main();

                        // await TelegramService.sendMessage(chat.id,`Добренько!`)
                        return { data: true }
                    }
                    case '/ppNext': {
                        await ProPresenterService.slideNext()

                        await TelegramService.sendMessage(chat.id,`Next slide`)
                        return { data: true }
                    }
                    case '/ppPrev': {
                        await ProPresenterService.slidePrev()

                        await TelegramService.sendMessage(chat.id,`Prev slide`)
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
                                // Do not create dups
                                if(isExists){
                                    await TelegramService.sendMessage(chat.id,`Добре! Наступного разу нагадування спрацює ${moment(isExists.nextSendAt).utcOffset('+02:00').format('DD/MM HH:mm')}`)
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
                                await TelegramService.sendMessage(chat.id,`Добре! Наступного разу нагадування спрацює ${moment(nextDate).utcOffset('+02:00').format('DD/MM HH:mm')}`)
                                return { data: true }
                            }
                        }
                        // await TelegramService.sendMessage(chat.id,'Я не знаю цю команду!')
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