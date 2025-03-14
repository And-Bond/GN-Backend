import TelegramUsersModel from '@app/Models/TelegramUserModel.js'

const getById = (id) => {
    return TelegramUsersModel.findById(id)
}

const getOne = (criteria) => {
    return TelegramUsersModel.findOne(criteria)
}

const getMany = (criteria) => {
    return TelegramUsersModel.find(criteria)
}

const create = (userData,options:any = {}) => {
    options.lean = true
    return TelegramUsersModel.create(userData,options)
}

const updateOne = (criteria, updateData, options:any = {}) => {
    options.lean = true
    options.new = true
    return TelegramUsersModel.findOneAndUpdate(criteria,updateData,options)
}

const updateMany = (criteria, updateData, options:any = {}) => {
    options.lean = true
    options.new = true
    return TelegramUsersModel.updateMany(criteria,updateData,options)
}

const deleteOne = (criteria) => {
    return TelegramUsersModel.deleteOne(criteria)
}

const deleteMany = (criteria) => {
    return TelegramUsersModel.deleteMany(criteria)
}

const aggregate = (criteria) => {
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