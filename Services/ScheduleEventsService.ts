import ScheduleEventsModel from '../Models/ScheduleEventsModel.js'
// Type imports
import type mongoose from 'mongoose'
import type { FilterQuery, UpdateQuery, QueryOptions, CreateOptions, MongooseUpdateQueryOptions, PipelineStage } from 'mongoose';
import type { IScheduleEvent } from '../Models/ScheduleEventsModel.js'
type ObjectId = mongoose.Types.ObjectId

const getById = (id: ObjectId) => {
    return ScheduleEventsModel.findById(id)
}

const getOne = (criteria: FilterQuery<IScheduleEvent>) => {
    return ScheduleEventsModel.findOne(criteria)
}

const getMany = (criteria: FilterQuery<IScheduleEvent>) => {
    return ScheduleEventsModel.find(criteria)
}

const create = (userData: IScheduleEvent,options: CreateOptions = {}) => {
    return ScheduleEventsModel.create(userData, options)
}

const updateOne = (criteria: FilterQuery<IScheduleEvent>, updateData: UpdateQuery<IScheduleEvent>, options: QueryOptions = {}) => {
    options.lean = true
    options.new = true
    return ScheduleEventsModel.findOneAndUpdate(criteria, updateData, options)
}

const updateMany = (criteria: FilterQuery<IScheduleEvent>, updateData: UpdateQuery<IScheduleEvent>, options: MongooseUpdateQueryOptions<IScheduleEvent> = {}) => {
    return ScheduleEventsModel.updateMany(criteria,updateData,options)
}

const deleteOne = (criteria: FilterQuery<IScheduleEvent>) => {
    return ScheduleEventsModel.deleteOne(criteria)
}

const deleteMany = (criteria: FilterQuery<IScheduleEvent>) => {
    return ScheduleEventsModel.deleteMany(criteria)
}

const aggregate = (criteria: PipelineStage[]): Promise<IScheduleEvent[]> => {
    return ScheduleEventsModel.aggregate(criteria).allowDiskUse(true)
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