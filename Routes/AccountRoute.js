const Joi = require('joi')
Joi.objectId = require('joi-objectid')(Joi);
const Services = require('../Services')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const AccountController = require('../Controllers/AccountController')
const { UnFx } = require('../Other/UniversalFunctions')

const accountValidation = Joi.object({

})

const accountOptionalValidation = Joi.object({

})

module.exports = [
    {
        method: 'GET',
        path: '/accounts/{_id}',
        handler: async(req, h) => AccountController.getAccountById(req)
        .then(res => UnFx.sendSuccess(res, h))
        .catch(err => UnFx.sendError(err, h)),
        options: {
            description: 'Get Account By Id',
            tags: ['api', 'accounts', 'get'],
            validate: {
                params: Joi.object({
                    _id: Joi.objectId().required()
                }),
                query: Joi.object({
                }).optional(),
                failAction: UnFx.failAction
            },
            auth: 'jwt'
        }
    },
    {
        method: 'GET',
        path: '/accounts',
        handler: async(req, h) => AccountController.getAccounts(req)
        .then(res => UnFx.sendSuccess(res, h))
        .catch(err => UnFx.sendError(err, h)),
        options: {
            description: 'Get Accounts',
            tags: ['api', 'accounts', 'get'],
            validate: {
                query: Joi.object({
                }).optional(),
                failAction: UnFx.failAction
            },
            auth: 'jwt'
        }
    },
    {
        method: 'POST',
        path: '/accounts',
        handler: async(req, h) => AccountController.createAccount(req)
        .then(res => UnFx.sendSuccess(res, h))
        .catch(err => UnFx.sendError(err, h)),
        options: {
            description: 'Create New Account',
            tags: ['api', 'accounts', 'create'],
            validate: {
                payload: accountValidation,
                failAction: UnFx.failAction
            }
        }
    },
    {
        method: 'PATCH',
        path: '/accounts/{_id}',
        handler: async(req, h) => AccountController.updateAccount(req)
        .then(res => UnFx.sendSuccess(res, h))
        .catch(err => UnFx.sendError(err, h)),
        options: {
            description: 'Updates Some Account',
            tags: ['api', 'accounts', 'update'],
            validate: {
                params: Joi.object({
                    _id: Joi.objectId().required()
                }),
                payload: accountOptionalValidation,
                failAction: UnFx.failAction
            },
            auth: 'jwt'
        }
    },
    {
        method: 'DELETE',
        path: '/accounts/{_id}',
        handler: async(req, h) => AccountController.deleteAccount(req)
        .then(res => UnFx.sendSuccess(res, h))
        .catch(err => UnFx.sendError(err, h)),
        options: {
            description: 'Delete Some Account',
            tags: ['api', 'accounts', 'delete'],
            validate: {
                params: Joi.object({
                    _id: Joi.objectId().required()
                }).required(),
                failAction: UnFx.failAction
            },
            auth: 'jwt'
        }
    },
]