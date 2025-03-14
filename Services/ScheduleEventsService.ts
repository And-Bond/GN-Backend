import ScheduleEventsModel from '@app/Models/ScheduleEventsModel.js'

const getById = (id) => {
    return ScheduleEventsModel.findById(id)
}

const getOne = (criteria) => {
    return ScheduleEventsModel.findOne(criteria)
}

const getMany = (criteria) => {
    return ScheduleEventsModel.find(criteria)
}

const create = (data,options:any = {}) => {
    options.lean = true
    return ScheduleEventsModel.create(data,options)
}

const updateOne = (criteria, updateData, options:any = {}) => {
    options.lean = true
    options.new = true
    return ScheduleEventsModel.findOneAndUpdate(criteria,updateData,options)
}

const updateMany = (criteria, updateData, options:any = {}) => {
    options.lean = true
    options.new = true
    return ScheduleEventsModel.updateMany(criteria,updateData,options)
}

const deleteOne = (criteria) => {
    return ScheduleEventsModel.deleteOne(criteria)
}

const deleteMany = (criteria) => {
    return ScheduleEventsModel.deleteMany(criteria)
}

const aggregate = (criteria) => {
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