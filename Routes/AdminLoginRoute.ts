import Joi from '../joi.js'
import UnFx from '../Other/UniversalFunctions.js'
import AdminLoginController from '../Controllers/AdminLoginController.js'
import type { ResponseToolkit } from '@hapi/hapi'
import type Hapi from '@hapi/hapi'

export type loginAdminRequest = {
    payload: {
        email: string,
        password: string
    }
}

export default [
    {
        method: 'POST',
        path: '/admin/login',
        handler: async(req: Hapi.Request & loginAdminRequest, h: ResponseToolkit) => AdminLoginController.loginAdmin(req)
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
        handler: async(req: Hapi.Request, h: ResponseToolkit) => AdminLoginController.loginAdminViaAccessToken(req)
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
        handler: async(req: Hapi.Request, h: ResponseToolkit) => AdminLoginController.logoutAdmin(req)
        .then(res => UnFx.sendSuccess(res, h))
        .catch(err => UnFx.sendError(err, h)),
        options: {
            description: 'Admin Logout',
            tags: ['api', 'admin', 'logout'],
            auth: 'jwt'
        }
    },
]