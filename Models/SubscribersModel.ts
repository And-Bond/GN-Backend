import mongoose from "mongoose"
const Schema = mongoose.Schema
type ObjectId = mongoose.Types.ObjectId

export interface ISubscriber {
    _id: ObjectId;
    tg_name?: string;
    chat_id: string;
    phone?: string; 
    active: boolean;
    env: 'dev' | 'prod';
    createdAt: Date;
    updatedAt: Date;
}

const Subscriber = new Schema<ISubscriber>({
    chat_id: {
        type: String,
        required: true
    },
    tg_name: {
        type: String,
        required: false
    },
    phone: {
        type: String,
        required: false
    },
    active: {
        type: Boolean,
        default: false
    },
    env: {
        type: String,
        enum: ['dev', 'prod'],
        required: true
    }
},
{
    timestamps: true
})

Subscriber.index({ chat_id: 1, env: 1 }, { unique: true });

const SubscribersModel = mongoose.model('subscribers_tg_bot_gn', Subscriber)

export default SubscribersModel