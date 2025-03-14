import AccountModel from '@app/Models/AccountModel.js'
const getById = (id) => {
    return AccountModel.findById(id)
}

const getOne = (criteria) => {
    return AccountModel.findOne(criteria)
}

const getMany = (criteria) => {
    return AccountModel.find(criteria)
}

const create = (userData,options:any = {}) => {
    options.lean = true
    return AccountModel.create(userData,options)
}

const updateOne = (criteria, updateData, options:any = {}) => {
    options.lean = true
    options.new = true
    return AccountModel.findOneAndUpdate(criteria,updateData,options)
}

const updateMany = (criteria, updateData, options:any = {}) => {
    options.lean = true
    options.new = true
    return AccountModel.updateMany(criteria,updateData,options)
}

const deleteOne = (criteria) => {
    return AccountModel.deleteOne(criteria)
}

const deleteMany = (criteria) => {
    return AccountModel.deleteMany(criteria)
}

const aggregate = (criteria) => {
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