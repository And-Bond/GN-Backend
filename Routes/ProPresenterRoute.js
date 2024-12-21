const dotenv = require('dotenv')
dotenv.config()

/**
 * @author And-Bond
 */
module.exports = [
  {
      method: 'POST',
      path: '/pro_webhook',
      handler: async(req,h) => {
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

      }
  },
]