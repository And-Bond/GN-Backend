import TelegramUsersModel from '../Models/TelegramUserModel.js'
// Type imports
import type mongoose from 'mongoose'
import type { FilterQuery, UpdateQuery, QueryOptions, CreateOptions, MongooseUpdateQueryOptions, PipelineStage } from 'mongoose';
import type { ITelegramUser } from '../Models/TelegramUserModel.js'
type ObjectId = mongoose.Types.ObjectId

const getById = (id: ObjectId) => {
    return TelegramUsersModel.findById(id)
}

const getOne = (criteria: FilterQuery<ITelegramUser>) => {
    return TelegramUsersModel.findOne(criteria)
}

const getMany = (criteria: FilterQuery<ITelegramUser>) => {
    return TelegramUsersModel.find(criteria)
}

const create = (userData: ITelegramUser,options: CreateOptions = {}) => {
    return TelegramUsersModel.create(userData, options)
}

const updateOne = (criteria: FilterQuery<ITelegramUser>, updateData: UpdateQuery<ITelegramUser>, options: QueryOptions = {}) => {
    options.lean = true
    options.new = true
    return TelegramUsersModel.findOneAndUpdate(criteria, updateData, options)
}

const updateMany = (criteria: FilterQuery<ITelegramUser>, updateData: UpdateQuery<ITelegramUser>, options: MongooseUpdateQueryOptions<ITelegramUser> = {}) => {
    return TelegramUsersModel.updateMany(criteria,updateData,options)
}

const deleteOne = (criteria: FilterQuery<ITelegramUser>) => {
    return TelegramUsersModel.deleteOne(criteria)
}

const deleteMany = (criteria: FilterQuery<ITelegramUser>) => {
    return TelegramUsersModel.deleteMany(criteria)
}

const aggregate = (criteria: PipelineStage[]): Promise<ITelegramUser[]> => {
    return TelegramUsersModel.aggregate(criteria).allowDiskUse(true)
}

export default {
    getOne,
    getMany,
    getById,
    create,
    updateOne,
    updateMany,
    deleteOne,
    deleteMany,
    aggregate
}