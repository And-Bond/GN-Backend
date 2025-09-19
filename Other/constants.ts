
const BotName = process.env.NODE_ENV === 'PROD' ? '@gn_church_bot' : '@gn_church_dev_bot'

export default {
    ScheduleServiceTypesHuman: {
        SUNDAY_SERVICE_REMINDER: 'Нагадування списку пісень на неділю',
        SUNDEY_SERVICE_START_TIMER_REMINDER: 'Нагадування за 10хв до початку'
    },
    ScheduleServiceTypesCode: {
        SUNDAY_SERVICE_REMINDER: 'SUNDAY_SERVICE_REMINDER',
        SUNDEY_SERVICE_START_TIMER_REMINDER: 'SUNDEY_SERVICE_START_TIMER_REMINDER'
    },
    // Hard code planning center Sunday Service id
    PlanningCenterServiceIds: {
        SUNDAY_SERVICE: '1410194'
    },
    PlanningCenterWebhookEvents: {
        PLAN_UPDATED: 'services.v2.events.plan.updated',
        PLAN_DESTROYED: 'services.v2.events.plan.destroyed',
        PLAN_CREATED: 'services.v2.events.plan.created',
        LIVE_UPDATED: 'services.v2.events.plan.live.updated'
    },
    TgPhoneUsers: [
        "380663309198",
        "380631152409",
        "380681042287",
    ],
    BotName: BotName
}