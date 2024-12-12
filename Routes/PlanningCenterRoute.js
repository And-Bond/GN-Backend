const dotenv = require('dotenv')
dotenv.config()

module.exports = [
  {
      method: 'POST',
      path: '/planning-center-webhook',
      handler: async(req,h) => {
          try {
            
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