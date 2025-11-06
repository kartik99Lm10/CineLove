const { MongoClient } = require('mongodb');

let db;

const connectToMongoDB = async () => {
    try {
        const mongoUrl = process.env.MONGO_URL;
        
        const client = new MongoClient(mongoUrl, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            maxPoolSize: 10,
            retryWrites: true,
            w: 'majority'
        });
        
        await client.connect();
        db = client.db();
        console.log('Connected to MongoDB Atlas');
        return db;
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

const getDatabase = () => {
    if (!db) {
        throw new Error('Database not initialized. Call connectToMongoDB first.');
    }
    return db;
};

module.exports = {
    connectToMongoDB,
    getDatabase
};
