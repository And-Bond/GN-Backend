import mongoose from "mongoose"
const Schema = mongoose.Schema
const ObjectId = mongoose.Types.ObjectId
import constants from "@app/Other/constants.js"

const Contact = new Schema({
    name: {
        type: String,
        required: true
    },
    emails: [{
        value: String,
    }],
    phones: [{
        value: String
    }],
    accountId: {
        ref: 'Account',
        type: ObjectId,
        required: true
    },
    active: {
        type: Boolean,
        default: true
    },
    auth: {
        email: String,
        password: String
    },
    telegramId: String
}, { timestamps: true })


const ContactModel = mongoose.model('Contact', Contact)

export default ContactModel