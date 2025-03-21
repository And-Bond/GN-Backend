import mongoose from "mongoose";
type ObjectId = mongoose.Types.ObjectId
import type { Document } from 'mongoose'

export interface IAuthTokenModal extends Document {
    _id: ObjectId;
    accessToken: string,
    contactId?: ObjectId,
    createdAt?: Date
}


const AuthTokenSchema = new mongoose.Schema<IAuthTokenModal>({
    accessToken: {
        type: String,
        required: true
    },
    contactId: {
        type: mongoose.Types.ObjectId,
        ref: 'Contact'
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
})

export default mongoose.model('AuthToken', AuthTokenSchema);