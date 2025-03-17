import mongoose from "mongoose"
const Schema = mongoose.Schema
const ObjectId = mongoose.Types.ObjectId

export interface ITelegramUser {
    userId: string,
    active?: boolean,
    auth?: {
        name?: string,
        password?: string
    },
    lastMessageAt?: Date
}

const TelegramUser = new Schema<ITelegramUser>({
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


