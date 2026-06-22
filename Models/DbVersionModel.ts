import mongoose, { Document } from 'mongoose'
const Schema = mongoose.Schema

export interface IDbVersionHistoryEntry {
    version: number;
    appliedAt: Date;
}

export interface IDbVersionModel extends Document {
    currentVersion: number;
    history: IDbVersionHistoryEntry[];
}

const DbVersionSchema = new Schema<IDbVersionModel>({
    currentVersion: {
        type: Number,
        required: true,
        default: 0
    },
    history: {
        type: [{
            version: { type: Number, required: true },
            appliedAt: { type: Date, required: true }
        }],
        default: []
    }
})

const DbVersionModel = mongoose.model('DbVersion', DbVersionSchema)

export default DbVersionModel
