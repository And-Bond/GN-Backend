const telegramRoutes = require('./TelegramRoute')
const propresenterRoutes = require('./ProPresenterRoute')
const planningCenterRoute = require('./PlanningCenterRoute')
const contactRoute = require('./ContactRoute')
const accountRoute = require('./AccountRoute')
const adminLoginRoute = require('./AdminLoginRoute')

module.exports = [].concat(
    telegramRoutes,
    propresenterRoutes,
    planningCenterRoute,
    contactRoute,
    accountRoute,
    adminLoginRoute
)