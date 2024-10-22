'use strict';

const Hapi = require('@hapi/hapi');
const dotenv = require('dotenv');
dotenv.config()

const { API_HOST } = process.env

const routes = require('./Routes/index')

const init = async () => {
    // Create a new Hapi server instance
    const server = Hapi.server({
        port: API_HOST,        // Set the port
        host: 'localhost', // Set the host
    });

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
};

// Handle any errors when starting the server
process.on('unhandledRejection', (err) => {
    console.log(err);
    process.exit(1);
});

// Initialize the server
init()