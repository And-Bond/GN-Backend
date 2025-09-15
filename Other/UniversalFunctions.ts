import type { ResponseToolkit } from '@hapi/hapi'
import type Hapi from '@hapi/hapi'

const sendSuccess = (data = {}, hapi: ResponseToolkit, message = "Success", statusCode = 200) => hapi.response({ success: true, message, data }).code(statusCode)
const sendError = (data:any = {}, hapi: ResponseToolkit, message = "Error", statusCode = 400) => {
    return hapi.response({ success: false, message: message, data }).code(data.statusCode || statusCode)
}
const failAction = (req: Hapi.Request, hapi: ResponseToolkit, error: any) => module.exports.sendError({ message: "Validation failed: " + error.details.map((d: any) => `${d.message}`).join(", ") }, hapi, 400).takeover()

export default {
    sendSuccess,
    sendError,
    failAction
}