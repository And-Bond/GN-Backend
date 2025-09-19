import mongoose from "mongoose"
const Schema = mongoose.Schema
type ObjectId = mongoose.Types.ObjectId

export interface ISubscriber {
    _id: ObjectId;
    chat_id: string;
    phone: string;
    active: boolean;
    createdAt: Date
    updatedAt: Date
}

const Subscriber = new Schema<ISubscriber>({
    chat_id: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    active: {
        type: Boolean,
        default: true
    },
},
{
    timestamps: true
}
)

const SubscribersModel = mongoose.model('subscribers_tg_bot_gn', Subscriber)

export default SubscribersModel
