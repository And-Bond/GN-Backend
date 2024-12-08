const telegramRoutes = require('./TelegramRoute')
const propresenterRoutes = require('./ProPresenterRoute')

module.exports = [].concat(
    telegramRoutes,
    propresenterRoutes
)