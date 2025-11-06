const express = require('express');
const helmet = require('helmet');
const compression = require('compression');
require('dotenv').config();

const corsMiddleware = require('./middleware/cors');
const rateLimiter = require('./middleware/rateLimiter');
const requestLogger = require('./middleware/logger');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const apiRoutes = require('./routes');

const { connectToMongoDB } = require('./config/database');

const app = express();

app.use(helmet());
app.use(compression());
app.use(corsMiddleware);

app.use('/api/', rateLimiter);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(requestLogger);

app.use('/api', apiRoutes);

app.use(errorHandler);
app.use('*', notFoundHandler);

const startServer = async () => {
    try {
        await connectToMongoDB();
        
        const PORT = process.env.PORT || 8001;
        app.listen(PORT, () => {
            console.log(`🎬 Cinelove API (Node.js) running on http://localhost:${PORT}`);
            console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
            console.log(`🎭 TMDB configured: ${!!process.env.TMDB_API_KEY}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

process.on('SIGINT', () => {
    console.log('\n Shutting down gracefully...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n Shutting down gracefully...');
    process.exit(0);
});

module.exports = { app, startServer };
