import AccountModel from '../Models/AccountModel.js'
// Type imports
import type mongoose from 'mongoose'
import type { FilterQuery, UpdateQuery, QueryOptions, CreateOptions, MongooseUpdateQueryOptions, PipelineStage } from 'mongoose';
import type { IAccountModel } from '../Models/AccountModel.js'
type ObjectId = mongoose.Types.ObjectId

const getById = (id: ObjectId) => {
    return AccountModel.findById(id)
}

const getOne = (criteria: FilterQuery<IAccountModel>) => {
    return AccountModel.findOne(criteria)
}

const getMany = (criteria: FilterQuery<IAccountModel>) => {
    return AccountModel.find(criteria)
}

const create = (userData: IAccountModel,options: CreateOptions = {}) => {
    return AccountModel.create(userData, options)
}

const updateOne = (criteria: FilterQuery<IAccountModel>, updateData: UpdateQuery<IAccountModel>, options: QueryOptions = {}) => {
    options.lean = true
    options.new = true
    return AccountModel.findOneAndUpdate(criteria, updateData, options)
}

const updateMany = (criteria: FilterQuery<IAccountModel>, updateData: UpdateQuery<IAccountModel>, options: MongooseUpdateQueryOptions<IAccountModel> = {}) => {
    return AccountModel.updateMany(criteria,updateData,options)
}

const deleteOne = (criteria: FilterQuery<IAccountModel>) => {
    return AccountModel.deleteOne(criteria)
}

const deleteMany = (criteria: FilterQuery<IAccountModel>) => {
    return AccountModel.deleteMany(criteria)
}

const aggregate = (criteria: PipelineStage[]): Promise<IAccountModel[]> => {
    return AccountModel.aggregate(criteria).allowDiskUse(true)
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