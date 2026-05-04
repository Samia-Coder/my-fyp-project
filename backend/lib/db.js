import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/safira_mart";
        const conn = await mongoose.connect(mongoURI);
        console.log(`✅ MongoDB connected: ${conn.connection.host}`);
        
        // ✅ CREATE INDEXES for better performance
        await createIndexes();
    } catch (error) {
        console.log("❌ Error connecting to MongoDB:", error.message);
        process.exit(1);
    }
};

// ✅ DATABASE INDEXES - Faster queries
const createIndexes = async () => {
    try {
        const db = mongoose.connection.db;
        
        // Products collection indexes
        await db.collection('products').createIndex({ name: 'text', description: 'text' });
        await db.collection('products').createIndex({ category: 1, price: 1 });
        await db.collection('products').createIndex({ createdAt: -1 });
        await db.collection('products').createIndex({ isFeatured: 1 });
        
        // Users collection indexes
        await db.collection('users').createIndex({ email: 1 }, { unique: true });
        
        // Orders collection indexes
        await db.collection('orders').createIndex({ user: 1, createdAt: -1 });
        
        console.log('✅ Database indexes created successfully');
    } catch (error) {
        console.log('⚠️ Index creation warning:', error.message);
    }
};