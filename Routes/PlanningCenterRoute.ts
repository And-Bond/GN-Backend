import UnFx from '../Other/UniversalFunctions.js'
import PlanningCenterController from '../Controllers/PlanningCenterController.js'
// Types
import type { ResponseToolkit } from '@hapi/hapi'
import type Hapi from '@hapi/hapi'

export type getSongsForSundayServiceRequest = {
    query: {
        date: string
    }
}

export default [
    {
        method: 'GET',
        path: '/planning-center/sunday-songs',
        handler: async(req: Hapi.Request & getSongsForSundayServiceRequest, h: ResponseToolkit) => PlanningCenterController.getSongsForSundayService(req)
                .then(res => UnFx.sendSuccess(res, h))
                .catch(err => UnFx.sendError(err, h)),
    },
    {
        method: 'POST',
        path: '/planning-center-webhook',
        handler: PlanningCenterController.weebhook,
    },
]