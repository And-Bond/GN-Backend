import Joi from '../joi.js'
import ContactsController from '../Controllers/ContactsController.js'
import UnFx from '../Other/UniversalFunctions.js'

const contactValidation = Joi.object({

})

const contactOptionalValidation = Joi.object({

})

export default [
    {
        method: 'GET',
        path: '/contacts/{_id}',
        handler: async(req, h) => ContactsController.getContactById(req)
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
        handler: async(req, h) => ContactsController.getContacts(req)
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
        handler: async(req, h) => ContactsController.createContact(req)
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
        handler: async(req, h) => ContactsController.updateContact(req)
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
        handler: async(req, h) => ContactsController.deleteContact(req)
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