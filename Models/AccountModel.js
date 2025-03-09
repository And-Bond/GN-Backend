const mongoose = require('mongoose')
const Schema = mongoose.Schema
const ObjectId = mongoose.Types.ObjectId
const constants = require('../Other/constants.js')

const Account = new Schema({
    name: {
        type: String,
        required: true
    },
    emails: [{
        value: String,
    }],
    phones: [{
        value: String
    }],
}, { timestamps: true })


const AccountModel = mongoose.model('Account', Account)

module.exports = AccountModel