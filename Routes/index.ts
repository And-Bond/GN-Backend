import Hapi from '@hapi/hapi';
import telegramRoutes from './TelegramRoute.js'
import propresenterRoutes from './ProPresenterRoute.js'
import planningCenterRoute from './PlanningCenterRoute.js'
import contactRoute from './ContactRoute.js'
import accountRoute from './AccountRoute.js'
import adminLoginRoute from './AdminLoginRoute.js'

// type Route = Hapi.ReqRefDefaults

export default <any>[
    ...telegramRoutes,
    ...propresenterRoutes,
    ...planningCenterRoute,
    ...contactRoute,
    ...accountRoute,
    ...adminLoginRoute
]