import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);  // ✅ __filename se banao, __dirname se nahi!

// ✅ ROOT folder se .env load karo (2 levels up: lib → backend → root)
dotenv.config({ path: path.resolve(__dirname, "..", "..", ".env") });

export const connectDB = async () => {
    try {
        console.log("📁 __dirname:", __dirname);
        console.log("📁 Looking for .env at:", path.resolve(__dirname, "..", "..", ".env"));
        console.log("🔍 MONGO_URI value:", process.env.MONGO_URI ? "EXISTS ✅" : "UNDEFINED ❌");
        
        const mongoURI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/safira_mart";
        
        console.log("🔗 Connecting to:", mongoURI.includes('atlas') ? 'MongoDB Atlas ☁️' : 'Local MongoDB 💻');
        
        const conn = await mongoose.connect(mongoURI);
        console.log(`✅ MongoDB connected: ${conn.connection.host}`);
        
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