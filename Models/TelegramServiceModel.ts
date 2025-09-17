import mongoose, { Schema, model, Document } from 'mongoose';
type ObjectId = mongoose.Types.ObjectId

export interface TelegramService extends Document {
  _id: ObjectId;
  name: string;
  phone: string;
  createdAt: Date;
  updatedAt: Date;
}

const TelegramServiceSchema = new Schema<TelegramService>({
    name: {
        type: String, required: true
    },
    phone: {
        type: String, required: true
    },
}, {
    timestamps: true
});

export const TelegramService = model<TelegramService>('TelegramService', TelegramServiceSchema);
