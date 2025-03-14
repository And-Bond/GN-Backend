const sendSuccess = (data = {}, hapi, message = "Success", statusCode = 200) => hapi.response({ success: true, message, data }).code(statusCode)
const sendError = (data:any = {}, hapi, message = "Error", statusCode = 400) => {
    return hapi.response({ success: false, message: message, data }).code(data.statusCode || statusCode)
}
const failAction = (req, hapi, error) => module.exports.sendError({ message: "Validation failed: " + error.details.map(d => `${d.message}`).join(", ") }, hapi, 400).takeover()

export default {
    sendSuccess,
    sendError,
    failAction
}