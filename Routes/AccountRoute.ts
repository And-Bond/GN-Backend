import Joi from '../joi.js'
import UnFx from '../Other/UniversalFunctions.js'
import AccountController from '../Controllers/AccountController.js'
// Type imports
import type { ResponseToolkit } from '@hapi/hapi'
import type Hapi from '@hapi/hapi'
import type { IAccountModel } from 'Models/AccountModel.js'

export type getAccountByIdRequest = {
    _id: string
}

export type getAccountsRequest = {
    query?: {[key: string]: any}
}

export type createAccountRequest = {
    payload: IAccountModel
}

export type updateAccountRequest = {
    params: {
        _id: string
    },
    payload: Partial<IAccountModel>
}

export type deleteAccountRequest = {
    params: {
        _id: string
    }
}

const accountValidation = Joi.object({

})

const accountOptionalValidation = Joi.object({

})

export default [
    {
        method: 'GET',
        path: '/accounts/{_id}',
        handler: async(req: Hapi.Request & getAccountByIdRequest, h: ResponseToolkit) => AccountController.getAccountById(req)
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
        handler: async(req: Hapi.Request & getAccountsRequest, h: ResponseToolkit) => AccountController.getAccounts(req)
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
        handler: async(req: Hapi.Request & createAccountRequest, h: ResponseToolkit) => AccountController.createAccount(req)
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
        handler: async(req: Hapi.Request & updateAccountRequest, h: ResponseToolkit) => AccountController.updateAccount(req)
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
        handler: async(req: Hapi.Request & deleteAccountRequest, h: ResponseToolkit) => AccountController.deleteAccount(req)
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