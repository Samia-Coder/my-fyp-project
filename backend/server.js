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

// ✅ CORS FIX - Production URL support added
const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:3000",
    process.env.CLIENT_URL,
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
}));

const PORT = process.env.PORT || 8000;
const __dirname = path.resolve();

// ✅ COMPRESSION - Faster responses
app.use(compression());

// ✅ CACHE HEADERS for images and static files
app.use((req, res, next) => {
    if (req.url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) {
        res.set('Cache-Control', 'public, max-age=86400');
    }
    next();
});

app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

// 🔒 SECURITY MIDDLEWARE
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { success: false, message: "Too many requests, please try again later" },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/', limiter);

app.use(mongoSanitize());

// ✅ CACHING HEADERS for API
app.use('/api/products', (req, res, next) => {
    res.set('Cache-Control', 'public, max-age=300');
    next();
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/chatbot", chatbotRoutes);
app.use("/api/orders", orderRoutes);

// ✅ 404 HANDLER
app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' });
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
//  VERCEL DEPLOYMENT FIX
// ============================================


// ============================================
// LOCAL DEVELOPMENT KE LIYE
// ============================================
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`✅ Server running on http://localhost:${PORT}`);
        connectDB();
    });
} else {
    // Production mein bhi DB connect karo
    connectDB();
}

// ============================================
// ⭐ VERCEL KE LIYE EXPORT - YEH MUST HAI!
// ============================================
export default app;