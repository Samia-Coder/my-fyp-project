import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "..", "..", ".env") });

export const connectDB = async () => {
    try {
        console.log("📁 __dirname:", __dirname);
        console.log("📁 Looking for .env at:", path.resolve(__dirname, "..", "..", ".env"));
        console.log("🔍 MONGO_URI value:", process.env.MONGO_URI ? "EXISTS ✅" : "UNDEFINED ❌");
        
        const mongoURI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/safira_mart";
        
        console.log("🔗 Connecting to:", mongoURI.includes('atlas') ? 'MongoDB Atlas ☁️' : 'Local MongoDB 💻');
        
        // ✅ ADD THESE OPTIONS TO mongoose.connect
        const conn = await mongoose.connect(mongoURI, {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            keepAlive: true,
            keepAliveInitialDelay: 300000,
        });
        
        console.log(`✅ MongoDB connected: ${conn.connection.host}`);
        
        // ✅ ADD CONNECTION EVENT HANDLERS
        mongoose.connection.on('error', (err) => {
            console.error('❌ MongoDB connection error:', err);
        });
        
        mongoose.connection.on('disconnected', () => {
            console.log('⚠️ MongoDB disconnected, attempting reconnect...');
        });
        
        await createIndexes();
    } catch (error) {
        console.log("❌ Error connecting to MongoDB:", error.message);
        process.exit(1);
    }
};

const createIndexes = async () => {
    try {
        const db = mongoose.connection.db;
        
        await db.collection('products').createIndex({ name: 'text', description: 'text' });
        await db.collection('products').createIndex({ category: 1, price: 1 });
        await db.collection('products').createIndex({ createdAt: -1 });
        await db.collection('products').createIndex({ isFeatured: 1 });
        
        await db.collection('users').createIndex({ email: 1 }, { unique: true });
        await db.collection('orders').createIndex({ user: 1, createdAt: -1 });
        
        console.log('✅ Database indexes created successfully');
    } catch (error) {
        console.log('⚠️ Index creation warning:', error.message);
    }
};