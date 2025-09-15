import ContactModel from '../Models/ContactModel.js'
// Type imports
import type mongoose from 'mongoose'
import type { FilterQuery, UpdateQuery, QueryOptions, CreateOptions, MongooseUpdateQueryOptions, PipelineStage } from 'mongoose';
import type { IContactModel } from '../Models/ContactModel.js'
type ObjectId = mongoose.Types.ObjectId

const getById = (id: ObjectId) => {
    return ContactModel.findById(id)
}

const getOne = (criteria: FilterQuery<IContactModel>) => {
    return ContactModel.findOne(criteria)
}

const getMany = (criteria: FilterQuery<IContactModel>) => {
    return ContactModel.find(criteria)
}

const create = (userData: IContactModel,options: CreateOptions = {}) => {
    return ContactModel.create(userData, options)
}

const updateOne = (criteria: FilterQuery<IContactModel>, updateData: UpdateQuery<IContactModel>, options: QueryOptions = {}) => {
    options.lean = true
    options.new = true
    return ContactModel.findOneAndUpdate(criteria, updateData, options)
}

const updateMany = (criteria: FilterQuery<IContactModel>, updateData: UpdateQuery<IContactModel>, options: MongooseUpdateQueryOptions<IContactModel> = {}) => {
    return ContactModel.updateMany(criteria,updateData,options)
}

const deleteOne = (criteria: FilterQuery<IContactModel>) => {
    return ContactModel.deleteOne(criteria)
}

const deleteMany = (criteria: FilterQuery<IContactModel>) => {
    return ContactModel.deleteMany(criteria)
}

const aggregate = (criteria: PipelineStage[]): Promise<IContactModel[]> => {
    return ContactModel.aggregate(criteria).allowDiskUse(true)
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