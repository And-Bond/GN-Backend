const telegramRoutes = require('./TelegramRoute')
const propresenterRoutes = require('./ProPresenterRoute')
const planningCenterRoute = require('./PlanningCenterRoute')

module.exports = [].concat(
    telegramRoutes,
    propresenterRoutes,
    planningCenterRoute
)