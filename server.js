'use strict';

const Hapi = require('@hapi/hapi');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

const ytdl = require('ytdl-core');
const fs = require('fs');


ytdl('https://youtu.be/dQw4w9WgXcQ?si=h6t1gYmN1rVyM6AD', {
filter: (format) => format.container === 'mp4' && format.audioBitrate,
quality: 'highest',
})
.pipe(fs.createWriteStream('video-highest.mp4'))
.on('finish', () => {
    console.log('Video downloaded (highest quality MP4).');
});

dotenv.config()

const cronJob = require('./Other/CronJob')
const handelbars = require('./Templates/HandelBars')

const { RAILWAY_PUBLIC_DOMAIN: API_PATH, API_HOST, MONGODB_PATH, NODE_ENV } = process.env

const routes = require('./Routes/index')

const { setWebhook } = require('./Services/TelegramService')



const init = async () => {
    // Create a new Hapi server instance
    const server = Hapi.server({
        port: API_HOST,        // Set the port
        host: NODE_ENV === 'LOCAL' ? API_PATH : '0.0.0.0', // Set the host
    });
    
    // Basic route: Responds with "Hello, Hapi!" when accessed via GET
    server.route({
        method: 'GET',
        path: '/',
        handler: (request, h) => {
            return 'GN Backed is working good';
        }
    });

    server.ext('onRequest', (request, h) => {
        console.log(`Incoming Request: ${request.method.toUpperCase()} ${request.path}`);
        return h.continue;
    });

    // Log after the response is sent
    server.ext('onPreResponse', (request, h) => {
        const response = request.response;
        if (response.isBoom) {
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
    console.log('MongoDB Connected!',mongoRes?.connections?.[0]?._connectionString || '')
    // Setting webhook path to telegram bot once deployed
    if(NODE_ENV === 'PROD'){
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