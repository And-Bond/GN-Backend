const ContactModel = require('../Models/ContactModel')

const getById = (id) => {
    return ContactModel.findById(id)
}

const getOne = (criteria) => {
    return ContactModel.findOne(criteria)
}

const getMany = (criteria) => {
    return ContactModel.find(criteria)
}

const create = (userData,options = {}) => {
    options.lean = true
    return ContactModel.create(userData,options)
}

const updateOne = (criteria, updateData, options = {}) => {
    options.lean = true
    options.new = true
    return ContactModel.findOneAndUpdate(criteria,updateData,options)
}

const updateMany = (criteria, updateData, options = {}) => {
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

module.exports = {
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