import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGO_URI;
        
        if (!mongoURI) {
            console.log("❌ MONGO_URI missing in environment variables!");
            return;
        }
        
        console.log("🔗 Connecting to:", mongoURI.includes('atlas') ? 'MongoDB Atlas ☁️' : 'Local MongoDB 💻');
        
        const conn = await mongoose.connect(mongoURI);
        console.log(`✅ MongoDB connected: ${conn.connection.host}`);
        
        await createIndexes();
    } catch (error) {
        console.log("❌ MongoDB Error:", error.message);
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