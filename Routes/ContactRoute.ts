import Joi from '../joi.js'
import ContactsController from '../Controllers/ContactsController.js'
import UnFx from '../Other/UniversalFunctions.js'
// Type imports
import type { ResponseToolkit } from '@hapi/hapi'
import type Hapi from '@hapi/hapi'
import type { IContactModel } from 'Models/ContactModel.js'

export type getContactByIdRequest = {
    params: {
        _id: string,
    }
}

export type createContactRequest = {
    payload: IContactModel
}

export type updateContactRequest = {
    params: {
        _id: string
    },
    payload: Partial<IContactModel>
}

export type deleteContactRequest = {
    params: {
        _id: string
    }
}

const contactValidation = Joi.object({

})

const contactOptionalValidation = Joi.object({

})

export default [
    {
        method: 'GET',
        path: '/contacts/{_id}',
        handler: async(req: Hapi.Request & getContactByIdRequest, h: ResponseToolkit) => ContactsController.getContactById(req)
        .then(res => UnFx.sendSuccess(res, h))
        .catch(err => UnFx.sendError(err, h)),
        options: {
            description: 'Get Contact By Id',
            tags: ['api', 'contacts', 'get'],
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
        path: '/contacts',
        handler: async(req: Hapi.Request, h: ResponseToolkit) => ContactsController.getContacts(req)
        .then(res => UnFx.sendSuccess(res, h))
        .catch(err => UnFx.sendError(err, h)),
        options: {
            description: 'Get Contacts',
            tags: ['api', 'contacts', 'get'],
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
        path: '/contacts',
        handler: async(req: Hapi.Request & createContactRequest, h: ResponseToolkit) => ContactsController.createContact(req)
        .then(res => UnFx.sendSuccess(res, h))
        .catch(err => UnFx.sendError(err, h)),
        options: {
            description: 'Create New Contact',
            tags: ['api', 'contacts', 'create'],
            validate: {
                payload: contactValidation,
                failAction: UnFx.failAction
            }
        }
    },
    {
        method: 'PATCH',
        path: '/contacts/{_id}',
        handler: async(req: Hapi.Request & updateContactRequest, h: ResponseToolkit) => ContactsController.updateContact(req)
        .then(res => UnFx.sendSuccess(res, h))
        .catch(err => UnFx.sendError(err, h)),
        options: {
            description: 'Updates Some Contact',
            tags: ['api', 'contacts', 'update'],
            validate: {
                params: Joi.object({
                    _id: Joi.objectId().required()
                }),
                payload: contactOptionalValidation,
                failAction: UnFx.failAction
            },
            auth: 'jwt'
        }
    },
    {
        method: 'DELETE',
        path: '/contacts/{_id}',
        handler: async(req: Hapi.Request & deleteContactRequest, h: ResponseToolkit) => ContactsController.deleteContact(req)
        .then(res => UnFx.sendSuccess(res, h))
        .catch(err => UnFx.sendError(err, h)),
        options: {
            description: 'Delete Some Contact',
            tags: ['api', 'contacts', 'delete'],
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