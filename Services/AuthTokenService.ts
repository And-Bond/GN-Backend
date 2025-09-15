import AuthTokenModal from '../Models/AuthTokenModel.js'
// Type imports
import type mongoose from 'mongoose'
import type { FilterQuery, UpdateQuery, QueryOptions, CreateOptions, MongooseUpdateQueryOptions, PipelineStage } from 'mongoose';
import type { IAuthTokenModel } from '../Models/AuthTokenModel.js'
type ObjectId = mongoose.Types.ObjectId

const getById = (id: ObjectId) => {
    return AuthTokenModal.findById(id)
}

const getOne = (criteria: FilterQuery<IAuthTokenModel>) => {
    return AuthTokenModal.findOne(criteria)
}

const getMany = (criteria: FilterQuery<IAuthTokenModel>) => {
    return AuthTokenModal.find(criteria)
}

const create = (userData: IAuthTokenModel,options: CreateOptions = {}) => {
    return AuthTokenModal.create(userData, options)
}

const updateOne = (criteria: FilterQuery<IAuthTokenModel>, updateData: UpdateQuery<IAuthTokenModel>, options: QueryOptions = {}) => {
    options.lean = true
    options.new = true
    return AuthTokenModal.findOneAndUpdate(criteria, updateData, options)
}

const updateMany = (criteria: FilterQuery<IAuthTokenModel>, updateData: UpdateQuery<IAuthTokenModel>, options: MongooseUpdateQueryOptions<IAuthTokenModel> = {}) => {
    return AuthTokenModal.updateMany(criteria,updateData,options)
}

const deleteOne = (criteria: FilterQuery<IAuthTokenModel>) => {
    return AuthTokenModal.deleteOne(criteria)
}

const deleteMany = (criteria: FilterQuery<IAuthTokenModel>) => {
    return AuthTokenModal.deleteMany(criteria)
}

const aggregate = (criteria: PipelineStage[]): Promise<IAuthTokenModel[]> => {
    return AuthTokenModal.aggregate(criteria).allowDiskUse(true)
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