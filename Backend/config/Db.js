const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

// Global connection state
let isConnected = false;

const connectDB = async (retryCount = 0) => {
    try {
        // Check if already connected
        if (isConnected && mongoose.connection.readyState === 1) {
            console.log('MongoDB already connected');
            return;
        }

        let mongoUri = process.env.MONGODB_URL || "mongodb://localhost:27017"
        if (!mongoUri) {
            throw new Error('MONGODB_URL is not defined');
        }

        // Clean the MongoDB URI by removing ALL unsupported options
        mongoUri = mongoUri
            .replace(/[&?]bufferMaxEntries=\d+/gi, '')
            .replace(/[&?]buffermaxentries=\d+/gi, '')
            .replace(/[&?]bufferCommands=(true|false)/gi, '')
            .replace(/[&?]buffercommands=(true|false)/gi, '')
            .replace(/[&?]bufferMaxEntries=(true|false)/gi, '')
            .replace(/[&?]buffermaxentries=(true|false)/gi, '');

        console.log(`Attempting to connect to MongoDB... (attempt ${retryCount + 1})`);

        // Optimized connection options for Vercel serverless
        const connectionOptions = {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            connectTimeoutMS: 10000,
            maxPoolSize: 10,
            minPoolSize: 5,
            maxIdleTimeMS: 30000,
            retryWrites: true,
            w: 'majority'
        };

        // Disable mongoose buffering for serverless
        mongoose.set('bufferCommands', false);
        mongoose.set('bufferMaxEntries', 0);

        await mongoose.connect(mongoUri, connectionOptions);
        isConnected = true;

        console.log(`MongoDB connected: ${mongoose.connection.host}`);

        // Add connection event listeners
        mongoose.connection.on('error', (err) => {
            console.error('MongoDB connection error:', err);
            isConnected = false;
        });

        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB disconnected');
            isConnected = false;
        });

    } catch (error) {
        console.error(`MongoDB connection error: ${error.message}`);
        isConnected = false;

        // Retry logic for serverless
        if (retryCount < 2) {
            console.log(`Retrying connection in 1 second...`);
            await new Promise(resolve => setTimeout(resolve, 1000));
            return connectDB(retryCount + 1);
        }

        throw error; // Don't exit process in serverless environment
    }
};


module.exports = connectDB;
