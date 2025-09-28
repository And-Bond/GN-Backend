'use strict';

import Hapi, { ResponseToolkit } from '@hapi/hapi';
import mongoose from 'mongoose';
import Boom from '@hapi/boom';

const { RAILWAY_PUBLIC_DOMAIN: API_PATH, API_HOST, MONGODB_PATH, NODE_ENV } = process.env;

if(!MONGODB_PATH){
    console.log('IMPORTANT ENV IS MISSING: MONGODB_PATH')
    process.exit(1)
}

import routes from './Routes/index.js';
import { initTelegramBot } from './Other/TelegramBots.js';
import { registerAuth } from './Other/auth.js';



const init = async () => {

    console.log('Starting server, current ENV:',NODE_ENV)

    // Create a new Hapi server instance
    const server = Hapi.server({
        port: API_HOST,        // Set the port
        host: NODE_ENV === 'LOCAL' ? API_PATH : '0.0.0.0', // Set the host
        routes: {
            cors: {
                origin: ['*']
            }
        }
    });

    // Register all plugins
    await registerAuth(server)
    
    // Basic route: Responds with "Hello, Hapi!" when accessed via GET
    server.route({
        method: 'GET',
        path: '/',
        handler: () => {
            return 'GN Backed is working good';
        }
    });

    server.ext('onRequest', (request: Hapi.Request, h: ResponseToolkit) => {
        console.log(`Incoming Request: ${request.method.toUpperCase()} ${request.path}`);
        return h.continue;
    });

    // Log after the response is sent
    server.ext('onPreResponse', (request: Hapi.Request, h: ResponseToolkit) => {
        const response = request.response;
        
        // Type guard to check if the response is an instance of Boom
        if (Boom.isBoom(response)) {
            console.error(`${response.output.statusCode} ${response.output.payload.message}`);
        } else {
            console.log(`Response to Request: ${request.method.toUpperCase()} ${request.path} ${response.statusCode}`);
        }
        
        return h.continue;
    })
    
    server.route(routes)


    // Start the server
    await server.start();
    console.log('Server running on %s', server.info.uri);

    // Conecting to mongoDb
    let mongoRes = await mongoose.connect(MONGODB_PATH)
    console.log('MongoDB Connected!',mongoRes?.connections?.[0]?.host + ':' + mongoRes?.connections?.[0]?.port + '/' + mongoRes?.connections?.[0]?.name || '')

    // Init Telegram Bot
    await initTelegramBot()

    // Init Cron
    await import('./Other/CronJob.js')
};

// Handle any errors when starting the server
process.on('unhandledRejection', (err) => {
    console.log(err);
    process.exit(1);
});

// Initialize the server
init()
console.log('Release Date: ', new Date()) 
