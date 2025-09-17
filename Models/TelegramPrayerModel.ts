import mongoose, { Schema, model, Document } from 'mongoose';
type ObjectId = mongoose.Types.ObjectId


export interface TelegramPrayer extends Document {
  _id: ObjectId;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

const TelegramPrayerSchema = new Schema<TelegramPrayer>({
    name: {
        type: String, required: true
    },
    description: {
        type: String, required: true
    },
}, {
    timestamps: true
});

export const TelegramPrayer = model<TelegramPrayer>('TelegramPrayer', TelegramPrayerSchema);
