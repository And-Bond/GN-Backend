import mongoose from "mongoose"
import constants from "../Other/constants.js"
// Type imports
import type { Document } from 'mongoose'
const Schema = mongoose.Schema
type ObjectId = mongoose.Types.ObjectId

export interface IAccountModel extends Document {
    _id: ObjectId;
    name: string
    emails?: { value: string }[]
    phones?: { value: string }[]
    createdAt?: Date
}

const Account = new Schema<IAccountModel>({
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
    createdAt: {
        type: Date,
        default: Date.now
    }
})


const AccountModel = mongoose.model('Account', Account)

export default AccountModel