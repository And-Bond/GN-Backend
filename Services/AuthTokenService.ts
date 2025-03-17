import AuthTokenModal from '../Models/AuthTokenModel.js'
// Type imports
import type mongoose from 'mongoose'
import type { FilterQuery, UpdateQuery, QueryOptions, CreateOptions, MongooseUpdateQueryOptions, PipelineStage } from 'mongoose';
import type { IAuthTokenModal } from '../Models/AuthTokenModel.js'
type ObjectId = mongoose.Types.ObjectId

const getById = (id: ObjectId) => {
    return AuthTokenModal.findById(id)
}

const getOne = (criteria: FilterQuery<IAuthTokenModal>) => {
    return AuthTokenModal.findOne(criteria)
}

const getMany = (criteria: FilterQuery<IAuthTokenModal>) => {
    return AuthTokenModal.find(criteria)
}

const create = (userData: IAuthTokenModal,options: CreateOptions = {}) => {
    return AuthTokenModal.create(userData, options)
}

const updateOne = (criteria: FilterQuery<IAuthTokenModal>, updateData: UpdateQuery<IAuthTokenModal>, options: QueryOptions = {}) => {
    options.lean = true
    options.new = true
    return AuthTokenModal.findOneAndUpdate(criteria, updateData, options)
}

const updateMany = (criteria: FilterQuery<IAuthTokenModal>, updateData: UpdateQuery<IAuthTokenModal>, options: MongooseUpdateQueryOptions<IAuthTokenModal> = {}) => {
    return AuthTokenModal.updateMany(criteria,updateData,options)
}

const deleteOne = (criteria: FilterQuery<IAuthTokenModal>) => {
    return AuthTokenModal.deleteOne(criteria)
}

const deleteMany = (criteria: FilterQuery<IAuthTokenModal>) => {
    return AuthTokenModal.deleteMany(criteria)
}

const aggregate = (criteria: PipelineStage[]): Promise<IAuthTokenModal[]> => {
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