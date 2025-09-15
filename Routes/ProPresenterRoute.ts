import Joi from '../joi.js'
import type Hapi from '@hapi/hapi'

type ProWebhook = {
  ngrok_url: string
}

export default [
  {
    method: 'POST',
    path: '/pro_webhook',
    handler: async(req: Hapi.Request & { payload: ProWebhook }) => {
        try {
          let payload = req.payload
          if(payload.ngrok_url){
            process.env.PRO_PRESENTER_PATH = payload.ngrok_url
            console.log('ProPresenter Webhook is set to', process.env.PRO_PRESENTER_PATH)
            return { msg: 'Success!, Set to ' + process.env.PRO_PRESENTER_PATH }
          }
          return { message: 'Failed to set ngrok url'}
        } catch (error) {
            console.log('ROUTE ERROR:',error)
            return { data: false }
        }

    },
    options: {
      validate: {
        payload: Joi.object({
          ngrok_url: Joi.string().required()
        })
      }
    }
  },
]