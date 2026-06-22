import Joi from '../joi.js'
import DbVersionController from '../Controllers/DbVersionController.js'
import UnFx from '../Other/UniversalFunctions.js'
import type { ResponseToolkit } from '@hapi/hapi'
import type Hapi from '@hapi/hapi'

export type runDbUpdateRequest = {
    params: {
        version: string
    }
}

export default [
    {
        method: 'POST',
        path: '/api/util/db/update/{version}',
        handler: async (req: Hapi.Request & runDbUpdateRequest, h: ResponseToolkit) => DbVersionController.runUpdate(req)
            .then(res => UnFx.sendSuccess(res, h))
            .catch(err => UnFx.sendError(err, h)),
        options: {
            description: 'Run DB migration for a specific version',
            tags: ['api', 'util', 'db'],
            validate: {
                params: Joi.object({
                    version: Joi.number().integer().min(1).required()
                }),
                failAction: UnFx.failAction
            },
            // auth: 'jwt'
        }
    },
    {
        method: 'GET',
        path: '/api/util/db/version',
        handler: async (req: Hapi.Request, h: ResponseToolkit) => DbVersionController.getVersion(req)
            .then(res => UnFx.sendSuccess(res, h))
            .catch(err => UnFx.sendError(err, h)),
        options: {
            description: 'Get current DB version and history',
            tags: ['api', 'util', 'db'],
            validate: {
                failAction: UnFx.failAction
            },
            // auth: 'jwt'
        }
    }
]
