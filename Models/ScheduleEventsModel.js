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
        enum: Object.keys(constants.ScheduleServiceTypesCode)
    }
})


const ScheduleEventsModel = mongoose.model('ScheduleEvents',ScheduleEvent)

module.exports = ScheduleEventsModel


