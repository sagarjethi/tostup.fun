import swaggerJsdoc from 'swagger-jsdoc';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'TostAI Backend API',
            version: '1.0.0',
            description: 'API documentation for TostAI trading agent backend',
        },
        servers: [
            {
                url: process.env.API_BASE_URL || 'http://localhost:3001',
                description: 'Development server',
            },
            {
                url: 'https://aliraapi.browsertype.xyz',
                description: 'Production server',
            },
        ],
        tags: [
            { name: 'Health', description: 'Health check endpoints' },
            { name: 'Agents', description: 'Trading agent management endpoints' },
            { name: 'History', description: 'Historical data endpoints' },
        ],
    },
    apis: ['./src/index.ts', './src/**/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);

