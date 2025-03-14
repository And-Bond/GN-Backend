import Joi from 'joi'
import joiObjectId from 'joi-objectid'
(Joi as any).objectId = joiObjectId(Joi)
import UnFx from '@app/Other/UniversalFunctions.js'
import AdminLoginController from '@app/Controllers/AdminLoginController.js'

export default [
    {
        method: 'POST',
        path: '/admin/login',
        handler: async(req, h) => AdminLoginController.loginAdmin(req)
        .then(res => UnFx.sendSuccess(res, h))
        .catch(err => UnFx.sendError(err, h)),
        options: {
            description: 'Admin Login Via email and password',
            tags: ['api', 'admin', 'login'],
            validate: {
                payload: Joi.object({
                    email: Joi.string().required(),
                    password: Joi.string().required()
                }).required(),
                failAction: UnFx.failAction
            }
        }
    },
    {
        method: 'POST',
        path: '/admin/loginViaAccessToken',
        handler: async(req, h) => AdminLoginController.loginAdminViaAccessToken(req)
        .then(res => UnFx.sendSuccess(res, h))
        .catch(err => UnFx.sendError(err, h)),
        options: {
            description: 'Admin Login Via Access Token',
            tags: ['api', 'admin', 'login'],
            auth: 'jwt'
        }
    },
    {
        method: 'POST',
        path: '/admin/logout',
        handler: async(req, h) => AdminLoginController.logoutAdmin(req)
        .then(res => UnFx.sendSuccess(res, h))
        .catch(err => UnFx.sendError(err, h)),
        options: {
            description: 'Admin Logout',
            tags: ['api', 'admin', 'logout'],
            auth: 'jwt'
        }
    },
]