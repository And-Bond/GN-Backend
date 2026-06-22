import DbVersionModel from '../Models/DbVersionModel.js'
import type { FilterQuery, UpdateQuery, QueryOptions } from 'mongoose'
import type { IDbVersionModel } from '../Models/DbVersionModel.js'

const getOne = (criteria: FilterQuery<IDbVersionModel>) => {
    return DbVersionModel.findOne(criteria)
}

const create = (data: Partial<IDbVersionModel>) => {
    return DbVersionModel.create(data)
}

const updateOne = (criteria: FilterQuery<IDbVersionModel>, updateData: UpdateQuery<IDbVersionModel>, options: QueryOptions = {}) => {
    options.lean = true
    options.new = true
    return DbVersionModel.findOneAndUpdate(criteria, updateData, options)
}

export default {
    getOne,
    create,
    updateOne
}
