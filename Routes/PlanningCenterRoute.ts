import constants from '../Other/constants.js'
import Services from '../Services/index.js'

const serviceId = process.env.NODE_ENV === 'PROD' ? constants.PlanningCenterServiceIds.SUNDAY_SERVICE : '1571901'

export default [
  {
      method: 'POST',
      path: '/planning-center-webhook',
      handler: async(req,h) => {
          try {
            let eventType = req.headers['x-pco-webhooks-name']
            let events = req.payload.data
            switch (eventType) {
                case constants.PlanningCenterWebhookEvents.LIVE_UPDATED:
                    for(let event of events){
                        let eventData = JSON.parse(event.attributes.payload)
                        const planId = eventData.data.relationships.plan.data.id
                        const itemId = eventData.data.relationships.item.data.id
                        const planItems = await Services.PlanningCenterService.getPlanItems(serviceId,planId)
                        const itemInfo = planItems?.data?.data?.find((item) => item.id === itemId)
                        if(itemInfo?.attributes?.title){
                            let toSend = await Services.ScheduleEventsService.getMany({
                                chatId: {
                                    $exists: true
                                },
                                type: constants.ScheduleServiceTypesCode.SUNDEY_SERVICE_START_TIMER_REMINDER,
                                planItemName: itemInfo.attributes.title
                            })
                            for(let schedule of toSend){
                                let payload = {
                                    chatId: schedule.chatId,
                                    message: 'До початку залишилося <b>10 хвилин!</b>',
                                    parseMode: 'HTML'
                                }
                                if(schedule.threadId){
                                    payload['messageThreadId'] = schedule.threadId
                                }
                                await Services.TelegramService.sendMessage(payload)
                            }
                        }
                    } 
                    break;
                default:
                    break;
            }
            return h.response({ message: 'test message'}).code(200)
          } catch (error) {
              console.log('ROUTE ERROR:',error)
              return h.response({ data: 'test message'}).code(200)
          }

      },
      options: {

      }
  },
]