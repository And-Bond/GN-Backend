import mongoose, { Document, InferSchemaType } from "mongoose";
type ObjectId = mongoose.Types.ObjectId

// export interface IAuthTokenModal extends Document {
//     _id: ObjectId;
//     accessToken: string,
//     contactId?: ObjectId,
//     createdAt?: Date
// }


const AuthTokenSchema = new mongoose.Schema({
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

export type IAuthTokenModel = InferSchemaType<typeof AuthTokenSchema>

export default mongoose.model('AuthToken', AuthTokenSchema);