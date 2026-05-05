import dotenv from "dotenv";
dotenv.config();

import express from "express";
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import cookieParser from "cookie-parser";
import path from "path";
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

// ✅ CORS FIX - Space removed!
const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:3000",
    process.env.CLIENT_URL,
    "https://my-fyp-project-black.vercel.app",  // ✅ Space removed
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
const __dirname = path.resolve();

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

// ✅ DB Connection - Vercel ke liye
let dbConnected = false;
const ensureDB = async () => {
    if (!dbConnected) {
        await connectDB();
        dbConnected = true;
    }
};

// API Routes with DB connection
app.use("/api/auth", async (req, res, next) => { await ensureDB(); next(); }, authRoutes);
app.use("/api/products", async (req, res, next) => { await ensureDB(); next(); }, productRoutes);
app.use("/api/cart", async (req, res, next) => { await ensureDB(); next(); }, cartRoutes);
app.use("/api/coupons", async (req, res, next) => { await ensureDB(); next(); }, couponRoutes);
app.use("/api/payments", async (req, res, next) => { await ensureDB(); next(); }, paymentRoutes);
app.use("/api/analytics", async (req, res, next) => { await ensureDB(); next(); }, analyticsRoutes);
app.use("/api/categories", async (req, res, next) => { await ensureDB(); next(); }, categoryRoutes);
app.use("/api/chatbot", async (req, res, next) => { await ensureDB(); next(); }, chatbotRoutes);
app.use("/api/orders", async (req, res, next) => { await ensureDB(); next(); }, orderRoutes);

// ✅ Health Check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// ✅ GLOBAL ERROR HANDLER
app.use((err, req, res, next) => {
    console.error('❌ Error:', err.stack);
    res.status(err.status || 500).json({ 
        success: false, 
        message: process.env.NODE_ENV === 'production' 
            ? 'Something went wrong!' 
            : err.message 
    });
});

// ============================================
// LOCAL DEVELOPMENT
// ============================================
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`✅ Server running on http://localhost:${PORT}`);
        ensureDB();
    });
}

// ============================================
// ⭐ VERCEL EXPORT
// ============================================
// ============================================
// ⭐ SERVE FRONTEND (Production only)
// ============================================
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../frontend/dist')));
    
    app.get('*', (req, res) => {
        if (!req.url.startsWith('/api')) {
            res.sendFile(path.resolve(__dirname, '../frontend/dist', 'index.html'));
        }
    });
}
export default app;