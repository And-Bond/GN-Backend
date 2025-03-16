import ContactModel from '../Models/ContactModel.js'

const getById = (id) => {
    return ContactModel.findById(id)
}

const getOne = (criteria) => {
    return ContactModel.findOne(criteria)
}

const getMany = (criteria) => {
    return ContactModel.find(criteria)
}

const create = (userData,options:any = {}) => {
    options.lean = true
    return ContactModel.create(userData,options)
}

const updateOne = (criteria, updateData, options:any = {}) => {
    options.lean = true
    options.new = true
    return ContactModel.findOneAndUpdate(criteria,updateData,options)
}

const updateMany = (criteria, updateData, options:any = {}) => {
    options.lean = true
    options.new = true
    return ContactModel.updateMany(criteria,updateData,options)
}

const deleteOne = (criteria) => {
    return ContactModel.deleteOne(criteria)
}

const deleteMany = (criteria) => {
    return ContactModel.deleteMany(criteria)
}

const aggregate = (criteria) => {
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