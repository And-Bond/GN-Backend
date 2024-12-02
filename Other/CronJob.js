const cron = require('node-cron'),
    constants = require('../Other/constants'),
    fs = require('fs'),
    handlebars = require('handlebars'),
    path = require('path'),
    moment = require('moment')

const TelegramUserService = require('../Services/TelegramUserService')
const ScheduleEventsService = require('../Services/ScheduleEventsService')
const PlanningCenterService = require('../Services/PlanningCenterService')
const TelegramService = require('../Services/TelegramService')

const SundayServiceTemplate = fs.readFileSync(path.resolve(__dirname, '../Templates/SundayService.html'), 'utf-8')

console.log('\n-------------------CRON--------------------\n')
console.log('            CRON Service Works!            ');
console.log('\n-------------------CRON--------------------\n')


const check = async () => {
    const allSchedules = await ScheduleEventsService.getMany(
            {
                nextSendAt: {
                    $lt: new Date(),
                    $exists: true
                },
                type: {
                    $exists: true
                },
                chatId:{
                    $exists: true
                }
            }
    )
    console.log('Schedule Events Check', new Date(), 'All schedules length',allSchedules?.length)
    // Sunday Service Reminder
    let sundayService = allSchedules.filter(sc => sc.type === constants.ScheduleServiceTypesCode.SUNDAY_SERVICE_REMINDER)
    console.log('SUNDAY SERVICE',sundayService?.length)
    if(sundayService.length){
        const plans = await PlanningCenterService.getPlansList(constants.PlanningCenterServiceIds.SUNDAY_SERVICE,{
            order: '-sort_date',
            filter: 'future',
            per_page: 1
        })
        const nextSundayPlan = plans.data?.data?.[0]
        if(!nextSundayPlan || moment(nextSundayPlan?.attributes?.sort_date).isBefore(moment())){
            console.warn('Failed to send Sunday Service reminder, no plan set!!!')
        }else {
            res = await PlanningCenterService.getPlanItems(constants.PlanningCenterServiceIds.SUNDAY_SERVICE,nextSundayPlan?.id)
            const allSongs = res.data.data.filter(item => item.attributes.item_type === 'song')
            const template = handlebars.compile(SundayServiceTemplate)
            const message = template({
                date: moment(nextSundayPlan.attributes.sort_date).format('DD/MM'),
                songs: allSongs.map(song => {
                    return {
                        title: song.attributes.title,
                        description: song.attributes.description
                    }
                })
            })
    
            for(let schedule of sundayService){
                try{
                    await TelegramService.sendMessage(schedule.chatId, message, { parse_mode: 'HTML' })
                    // Hard code every thursday
                    const nextTimeSchedule = moment().utc().startOf('hour').isoWeekday(4).set({hour: 15, minute: 0})
                    if(moment().utc().isAfter(nextTimeSchedule)){
                        nextTimeSchedule.add(1,'week')
                    }
                    await ScheduleEventsService.updateOne(
                        {
                            _id: schedule._id,
                        },
                        {
                            $set: {
                                nextSendAt: nextTimeSchedule
                            }
                        }
                    )
                } catch(err) {
                    console.log('Schedule Events send err',err,'DATA:',schedule)
                    continue
                }
            }
        }
    }
}

cron.schedule('*/15 * * * *', check)
// check()