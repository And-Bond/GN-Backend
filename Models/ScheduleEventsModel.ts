import mongoose from "mongoose"
const Schema = mongoose.Schema
const ObjectId = mongoose.Types.ObjectId
import constants from "../Other/constants.js"

const ScheduleEvent = new Schema({
    chatId: {
        type: String,
        // required: true
    },
    threadId: {
        type: String
    },
    nextSendAt: {
        type: Date
    },
    type: {
        type: String,
        enum: Object.keys(constants.ScheduleServiceTypesCode)
    },
    planItemName: {
        type: String
    }
})


const ScheduleEventsModel = mongoose.model('ScheduleEvents',ScheduleEvent)

export default ScheduleEventsModel


