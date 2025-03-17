import mongoose, { Document } from "mongoose"
const Schema = mongoose.Schema
type ObjectId = mongoose.Types.ObjectId
import constants from "../Other/constants.js"

export interface IContactModel extends Document {
    name: string;
    emails?: { value: string }[];
    phones?: { value: string }[];
    accountId: ObjectId;
    active?: boolean;
    auth: {
        email: string;
        password: string;
    };
    telegramId: string;
    createdAt?: Date;
}

const ContactSchema = new Schema<IContactModel>({
    name: {
        type: String,
        required: true
    },
    emails: {
        type: [{
            value: {
                type: String,
                required: true
            }
        }],
        default: []
    },
    phones: {
        type: [{
            value: {
                type: String,
                required: true
            }
        }],
        default: []
    },
    accountId: {
        type: Schema.Types.ObjectId,
        ref: "Account",
        required: true
    },
    active: {
        type: Boolean,
        default: true
    },
    auth: {
        email: { type: String, required: true },
        password: { type: String, required: true }
    },
    telegramId: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});


const ContactModel = mongoose.model('Contact', ContactSchema)

export default ContactModel