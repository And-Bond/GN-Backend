const dotenv = require('dotenv')
dotenv.config()

const BotName = process.env.NODE_ENV === 'PROD' ? '@gn_church_bot' : '@gn_church_dev_bot'

module.exports = {
    ScheduleServiceTypesHuman: {
        'SUNDAY_SERVICE_REMINDER': 'Нагадування списку пісень на неділю'
    },
    ScheduleServiceTypesCode: {
        'SUNDAY_SERVICE_REMINDER': 'SUNDAY_SERVICE_REMINDER'
    },
    // Hard code planning center Sunday Service id
    PlanningCenterServiceIds: {
        SUNDAY_SERVICE: '1410194'
    },
    PlanningCenterWebhookEvents: {
        PLAN_UPDATED: 'services.v2.events.plan.updated',
        PLAN_DESTROYED: 'services.v2.events.plan.destroyed',
        PLAN_UPDATED: 'services.v2.events.plan.created',
        LIVE_UPDATED: 'services.v2.events.plan.live.updated'
    },
    BotName: BotName
}