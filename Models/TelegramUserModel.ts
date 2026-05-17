import mongoose from "mongoose"
const Schema = mongoose.Schema
type ObjectId = mongoose.Types.ObjectId

export interface ITelegramUser {
    _id: ObjectId;
    userId: string,
    planningCenterId?: string
    telegramPhone?: string
    active?: boolean,
    lastMessageAt?: Date
}

const TelegramUser = new Schema<ITelegramUser>({
    userId: {
        type: String,
        required: true
    },
    planningCenterId: String,
    telegramPhone: String,
    active: Boolean,
    lastMessageAt: Date
})


const TelegramUsersModel = mongoose.model('TelegramUsers',TelegramUser)

export default TelegramUsersModel


