import cron from 'node-cron'
import constants from '../Other/constants.js'
import fs from 'fs'
import handlebars from '../Templates/HandleBars.js'
import path from 'path'
import moment from 'moment'

import ScheduleEventsService from '../Services/ScheduleEventsService.js'
import PlanningCenterService from '../Services/PlanningCenterService.js'
import TelegramService from '../Services/TelegramService.js'
import TelegramUserService from '../Services/TelegramUserService.js'
import { fileURLToPath } from 'url';
// Type imports
import type TelegramBot from 'node-telegram-bot-api'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SundayServiceTemplate = fs.readFileSync(path.resolve(__dirname, '../Templates/SundayService.html'), 'utf-8')

console.log('\n-------------------CRON--------------------\n')
console.log('            CRON Service Works!            ');
console.log('\n-------------------CRON--------------------\n')


const check = async () => {
    try{
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
        // Sunday Service Reminder
        let sundayService = allSchedules.filter(sc => sc.type === constants.ScheduleServiceTypesCode.SUNDAY_SERVICE_REMINDER)
        if(sundayService.length){
            const plans = await PlanningCenterService.getPlansList(constants.PlanningCenterServiceIds.SUNDAY_SERVICE, {
                order: 'sort_date',
                filter: 'future',
                per_page: 1
            })
            const nextSundayPlan = plans.data?.data?.[0]
            if(!nextSundayPlan || moment(nextSundayPlan?.attributes?.sort_date).isBefore(moment())){
                console.warn('Failed to send Sunday Service reminder, no plan set!!!')
            }else {
                const res = await PlanningCenterService.getPlanItems(constants.PlanningCenterServiceIds.SUNDAY_SERVICE,nextSundayPlan?.id)
                const allSongs = res.data.data.filter(item => item?.attributes?.item_type === 'song')
                if(!allSongs?.length){
                    console.warn('Failed to send Sunday Service reminder, no songs at plan',nextSundayPlan?.attributes?.dates)
                }
                const template = handlebars.compile(SundayServiceTemplate)


                const orgTeams = await PlanningCenterService.getOrganizationTeams()
                // ! Hardcoded
                const mediaTeam = orgTeams.data?.data?.find(team => team.attributes?.name === constants.PlanningCenterTeamNames.MEDIA)
                
                const planPeople = await PlanningCenterService.getPlanTeamMembers(constants.PlanningCenterServiceIds.SUNDAY_SERVICE, nextSundayPlan?.id)
                const allMediaTeamPeople = planPeople.data?.data?.filter(person => person.relationships?.team?.data?.id === mediaTeam?.id)

                const songsMessage = template({
                    date: moment(nextSundayPlan.attributes.sort_date).format('DD/MM'),
                    songs: allSongs.map(song => {
                        return {
                            title: song?.attributes?.title,
                            description: song?.attributes?.description
                        }
                    }),
                })
                const mediaTeamMessage = template({
                    date: moment(nextSundayPlan.attributes.sort_date).format('DD/MM'),
                    mediaMembers: allMediaTeamPeople.map(member => {
                        return {
                            name: member.attributes?.name,
                            position: member.attributes?.team_position_name
                        }
                    })
                })
        
                for(let schedule of sundayService){
                    try{
                        let options: TelegramBot.SendMessageOptions = { parse_mode: 'HTML' }
                        if(schedule.threadId){
                            options['message_thread_id'] = Number(schedule.threadId)
                        }
                        await TelegramService.sendMessage(schedule.chatId!, songsMessage, options)
                        await TelegramService.sendMessage(schedule.chatId!, mediaTeamMessage, options)
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
        // Send RSVP notifications for upcoming plans
        const usersWithPCId = await TelegramUserService.getMany({ planningCenterId: { $exists: true, $ne: null } })
        const organizationServiceTypes = await PlanningCenterService.getServiceTypes()
        for (const user of usersWithPCId) {
            try {
                const res = await PlanningCenterService.getPlanPeople(user.planningCenterId!)
                const planPersons = res.data?.data ?? []
                const includedPlans = res.data?.included ?? []

                for (const planPerson of planPersons) {
                    // Only send if user not confirmed it yet
                    if(planPerson?.attributes?.status !== 'U') continue

                    const planId = planPerson.relationships?.plan?.data?.id
                    if (!planId) continue

                    const plan = includedPlans.find(p => p.id === planId)
                    if (!plan) continue

                    const serviceType = organizationServiceTypes.data?.data?.find(s => s.id === plan?.relationships?.service_type?.data?.id)
                    if(!serviceType) continue

                    // Only plans happening within 3 days
                    if (moment(plan.attributes?.sort_date).isAfter(moment().add(3, 'days'))) continue

                    // Skip past plans
                    if (moment(plan.attributes?.sort_date).isBefore(moment())) continue

                    // Skip if already notified
                    if (user.sentToPlans?.some(s => s.planId === planId)) continue

                    const serviceTypeId = planPerson.relationships?.service_type?.data?.id
                    const position = planPerson.attributes?.team_position_name ?? '—'
                    const date = moment(plan.attributes?.sort_date).format('DD.MM.YYYY')
                    const text = `Привіт, нагадуємо що ти служиш: \n    \n${serviceType?.attributes?.name?.trim()} ${date} на позиції ${position}. \n\nПросимо підтвердити чи ти точно будеш натискаючи кнопки снизу.`

                    await TelegramService.sendMessage(Number(user.userId), text, {
                        reply_markup: {
                            inline_keyboard: [[
                                { text: 'Так ✅', callback_data: `PCRSVP:C:${planPerson.id}:${planId}:${serviceTypeId}` },
                                { text: 'Ні ❌',  callback_data: `PCRSVP:D:${planPerson.id}:${planId}:${serviceTypeId}` }
                            ]]
                        }
                    })

                    await TelegramUserService.updateOne(
                        { _id: user._id },
                        { $push: { sentToPlans: { planId, sentAt: new Date() } } }
                    )
                }
            } catch (err: any) {
                console.error(`[PC sync] failed for user ${user.userId}:`, err?.message)
            }
        }
    } catch(err: any) {
        console.error('CRON JOB EXECUTE ERROR', err?.message || err)
    }
}

cron.schedule('*/15 * * * *', check)
// check()
