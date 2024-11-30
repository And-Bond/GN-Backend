'use strict';

const Hapi = require('@hapi/hapi');
const dotenv = require('dotenv');
const mongoose = require('mongoose')
dotenv.config()

const cronJob = require('./Other/CronJob')
const handelbars = require('./Templates/HandelBars')

const { RAILWAY_PUBLIC_DOMAIN: API_PATH, API_HOST, MONGODB_PATH } = process.env

const routes = require('./Routes/index')

const { setWebhook } = require('./Services/TelegramService')

const init = async () => {
    // Create a new Hapi server instance
    const server = Hapi.server({
        port: API_HOST,        // Set the port
        host: '0.0.0.0', // Set the host
    });
    
    console.log(`path:host ${API_PATH}:${API_HOST}`)

    // Basic route: Responds with "Hello, Hapi!" when accessed via GET
    server.route({
        method: 'GET',
        path: '/',
        handler: (request, h) => {
            return 'GN Backed is working good';
        }
    });
    
    server.route(routes)

    // Start the server
    await server.start();
    console.log('Server running on %s', server.info.uri);
    // Conecting to mongoDb
    await mongoose.connect(MONGODB_PATH)
    console.log('MongoDB Connected!')
    // Setting webhook path to telegram bot once deployed
    if(API_PATH !== 'localhost'){
        await setWebhook(API_PATH + '/telegram')
        console.log('Telegram Webhook set to ',API_PATH + '/telegram')
    }
};

// Handle any errors when starting the server
process.on('unhandledRejection', (err) => {
    console.log(err);
    process.exit(1);
});

// Initialize the server
init()