import mongoose from 'mongoose'
import AuthTokenModel from '../Models/AccountModel.js'

const create = (data) => {
  return AuthTokenModel.create(data)
}

const getById = (id) => {
  return AuthTokenModel.findOne({ _id: new mongoose.Types.ObjectId(id) }, null, { lean: true })
}

const get = (criteria, projection = {}, options:any = {}) => {
  options.lean = true
  options.skip = Number(options.page)
  options.limit = Number(options.limit)


  return AuthTokenModel.find(criteria, projection, options)
    .skip((options.skip - 1) * options.limit)
    .sort({ createdAt: -1 })
}

const getOne = (query, projection = {}) => {
  return AuthTokenModel.findOne(query, projection)
}

const aggregate = async (criteria, populate) => {
  let data = await AuthTokenModel.aggregate(criteria).allowDiskUse(true).exec()

  if (populate) {
    return await AuthTokenModel.populate(data, populate)
  } else {
    return data
  }
}

const updateOne = (criteria, dataToSet, options) => {
  options = options || {}
  options.lean = true
  options.new = true
  return AuthTokenModel.updateOne(criteria, dataToSet, options)
}

const updateMany = (criteria, dataToSet, options) => {
  options = options || {}
  options.lean = true
  options.new = true
  return AuthTokenModel.updateMany(criteria, dataToSet, options)
}

const deleteOne = (criteria) => AuthTokenModel.deleteOne(criteria)

export default {
  create,
  getById,
  get,
  getOne,
  aggregate,
  updateOne,
  updateMany,
  deleteOne
}
