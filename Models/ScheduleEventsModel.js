const mongoose = require('mongoose')
const Schema = mongoose.Schema
const ObjectId = mongoose.Types.ObjectId
const constants = require('../Other/constants.js')

const ScheduleEvent = new Schema({
    chatId: {
        type: String,
        // required: true
    },
    nextSentAt: {
        type: Date
    },
    type: {
        type: String,
        enum: [
            constants.ScheduleServiceTypes.SUNDAY_SERVICE_REMINDER
        ]
    }
})


const ScheduleEventsModel = mongoose.model('ScheduleEvents',ScheduleEvent)

module.exports = ScheduleEventsModel


