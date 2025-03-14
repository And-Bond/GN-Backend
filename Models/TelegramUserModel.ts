import mongoose from "mongoose"
const Schema = mongoose.Schema
const ObjectId = mongoose.Types.ObjectId

const TelegramUser = new Schema({
    userId: {
        type: String,
        required: true
    },
    active: Boolean,
    auth: {
        name: String,
        password: String
    },
    lastMessageAt: Date
})


const TelegramUsersModel = mongoose.model('TelegramUsers',TelegramUser)

export default TelegramUsersModel


