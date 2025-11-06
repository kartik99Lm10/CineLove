const cors = require('cors');

const getAllowedOrigins = () => {
    const corsOrigins = process.env.CORS_ORIGINS || 'http://localhost:5173';
    if (corsOrigins === '*') {
        return true; // Allow all origins
    }
    return corsOrigins.split(',').map(origin => origin.trim());
};

const corsOptions = {
    origin: getAllowedOrigins(),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With']
};

console.log('CORS Origins:', getAllowedOrigins());

module.exports = cors(corsOptions);
