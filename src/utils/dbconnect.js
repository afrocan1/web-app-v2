import mongoose from "mongoose";

const MONGODB_URL = process.env.MONGODB_URL;
const DB_NAME = process.env.DB_NAME;

if (!MONGODB_URL) {
    console.warn("MONGODB_URL not defined - database features will be disabled");
}

// Cache connection in serverless environment
let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

const dbConnect = async () => {
    // If no MongoDB URL, skip connection
    if (!MONGODB_URL) {
        console.log("Database connection skipped - no MONGODB_URL");
        return null;
    }

    // Return existing connection
    if (cached.conn) {
        return cached.conn;
    }

    // Return pending connection
    if (cached.promise) {
        cached.conn = await cached.promise;
        return cached.conn;
    }

    // Create new connection
    const opts = {
        dbName: DB_NAME,
        bufferCommands: false, // Disable buffering in serverless
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
    };

    try {
        cached.promise = mongoose.connect(MONGODB_URL, opts);
        cached.conn = await cached.promise;
        console.log("Connected to database");
        return cached.conn;
    } catch (err) {
        cached.promise = null;
        console.error("Database connection error:", err);
        throw err;
    }
};

export default dbConnect;
