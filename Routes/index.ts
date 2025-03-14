import telegramRoutes from './TelegramRoute.js'
import propresenterRoutes from './ProPresenterRoute.js'
import planningCenterRoute from './PlanningCenterRoute.js'
import contactRoute from './ContactRoute.js'
import accountRoute from './AccountRoute.js'
import adminLoginRoute from './AdminLoginRoute.js'

export default [].concat(
    telegramRoutes,
    propresenterRoutes,
    planningCenterRoute,
    contactRoute,
    accountRoute,
    adminLoginRoute
)