import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

import express from "express";
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import cookieParser from "cookie-parser";
import cors from "cors";
import compression from 'compression';

import authRoutes from "./routes/auth.route.js";
import productRoutes from "./routes/product.route.js";
import cartRoutes from "./routes/cart.route.js";
import couponRoutes from "./routes/coupon.route.js";
import paymentRoutes from "./routes/payment.route.js";
import analyticsRoutes from "./routes/analytics.route.js";
import categoryRoutes from "./routes/category.route.js";
import chatbotRoutes from "./routes/chatbot.route.js";
import orderRoutes from "./routes/order.route.js";
import { connectDB } from "./lib/db.js";

const app = express();

const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:3000",
    process.env.CLIENT_URL,
    "https://my-fyp-project-black.vercel.app",
    "https://my-fyp-frontend-pink.vercel.app",
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            console.log('Blocked by CORS:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
}));

const PORT = process.env.PORT || 8000;

app.use(compression());

app.use((req, res, next) => {
    if (req.url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) {
        res.set('Cache-Control', 'public, max-age=86400');
    }
    next();
});

app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { success: false, message: "Too many requests, please try again later" },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/', limiter);

app.use(mongoSanitize());

let dbConnected = false;

const ensureDB = async (req, res, next) => {
    try {
        if (!dbConnected) {
            await connectDB();
            dbConnected = true;
        }
        next();
    } catch (error) {
        console.error("❌ DB Connection Failed:", error.message);
        return res.status(500).json({ 
            success: false, 
            message: "Database connection failed. Please try again later." 
        });
    }
};

app.use("/api/auth", ensureDB, authRoutes);
app.use("/api/products", ensureDB, productRoutes);
app.use("/api/cart", ensureDB, cartRoutes);
app.use("/api/coupons", ensureDB, couponRoutes);
app.use("/api/payments", ensureDB, paymentRoutes);
app.use("/api/analytics", ensureDB, analyticsRoutes);
app.use("/api/categories", ensureDB, categoryRoutes);
app.use("/api/chatbot", ensureDB, chatbotRoutes);
app.use("/api/orders", ensureDB, orderRoutes);

app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use((err, req, res, next) => {
    console.error('❌ Error:', err.stack);
    res.status(err.status || 500).json({ 
        success: false, 
        message: process.env.NODE_ENV === 'production' 
            ? 'Something went wrong!' 
            : err.message 
    });
});

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`✅ Server running on http://localhost:${PORT}`);
    });
}

module.exports = app;