const dotenv = require('dotenv')
dotenv.config()

const constants = require('../Other/constants')

module.exports = [
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
                    } 
                    break;
                case constants.PlanningCenterWebhookEvents.PLAN_UPDATED: 
                    for(let event of events){
                        let eventData = JSON.parse(event.attributes.payload)
                    } 
                    break;
                default:
                    break;
            }
            return { message: 'test message'}
          } catch (error) {
              console.log('ROUTE ERROR:',error)
              return { data: false }
          }

      },
      options: {

      }
  },
]