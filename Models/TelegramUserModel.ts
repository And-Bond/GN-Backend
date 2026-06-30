import mongoose from "mongoose"
const Schema = mongoose.Schema
type ObjectId = mongoose.Types.ObjectId

export interface ISentToPlan {
    planId: string
    sentAt: Date
}

export interface IPendingDecline {
    planPersonId: string
    planId: string
    serviceTypeId: string
    messageId: number
    createdAt: Date
    position?: string
    date?: string
    serviceName?: string
}

export interface ITelegramUser {
    _id: ObjectId;
    userId: string,
    planningCenterId?: string
    telegramPhone?: string
    active?: boolean,
    lastMessageAt?: Date
    sentToPlans?: ISentToPlan[]
    sentConfirmReminders?: ISentToPlan[]
    pendingDecline?: IPendingDecline
}

const TelegramUser = new Schema<ITelegramUser>({
    userId: {
        type: String,
        required: true
    },
    planningCenterId: String,
    telegramPhone: String,
    active: Boolean,
    lastMessageAt: Date,
    sentToPlans: [{ planId: String, sentAt: Date }],
    sentConfirmReminders: [{ planId: String, sentAt: Date }],
    pendingDecline: {
        planPersonId: String,
        planId: String,
        serviceTypeId: String,
        messageId: Number,
        createdAt: Date,
        position: String,
        date: String,
        serviceName: String
    }
})


const TelegramUsersModel = mongoose.model('TelegramUsers',TelegramUser)

export default TelegramUsersModel


