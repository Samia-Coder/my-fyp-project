// import dotenv from "dotenv";
// dotenv.config();

// import express from "express";
// import cookieParser from "cookie-parser";
// import path from "path";
// import cors from "cors";

// import authRoutes from "./routes/auth.route.js";
// import productRoutes from "./routes/product.route.js";
// import cartRoutes from "./routes/cart.route.js";
// import couponRoutes from "./routes/coupon.route.js";
// import paymentRoutes from "./routes/payment.route.js";
// import analyticsRoutes from "./routes/analytics.route.js";
// import categoryRoutes from "./routes/category.route.js";
// import chatbotRoutes from "./routes/chatbot.route.js";
// import { connectDB } from "./lib/db.js";

// const app = express();

// // ✅ CORS FIX - Allow ALL origins with credentials
// const allowedOrigins = [
//     "http://localhost:5173",
//     "http://localhost:5174",
//     "http://localhost:3000",
//     "https://my-fyp-project-production.up.railway.app",
//     process.env.CLIENT_URL,
// ].filter(Boolean);

// app.use(cors({
//     origin: function (origin, callback) {
//         // Allow requests with no origin (like same-origin or mobile apps)
//         if (!origin) return callback(null, true);
        
//         if (allowedOrigins.indexOf(origin) !== -1) {
//             callback(null, true);
//         } else {
//             console.log("CORS blocked origin:", origin); // Debug log
//             callback(new Error('Not allowed by CORS'));
//         }
//     },
//     credentials: true,
//     allowedHeaders: ['Content-Type', 'Authorization'],
//     methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
// }));

// const PORT = process.env.PORT || 8000;
// const __dirname = path.resolve();

// app.use(express.json({ limit: "10mb" }));
// app.use(cookieParser());

// // API Routes
// app.use("/api/auth", authRoutes);
// app.use("/api/products", productRoutes);
// app.use("/api/cart", cartRoutes);
// app.use("/api/coupons", couponRoutes);
// app.use("/api/payments", paymentRoutes);
// app.use("/api/analytics", analyticsRoutes);
// app.use("/api/categories", categoryRoutes);
// app.use("/api/chatbot", chatbotRoutes);

// // SERVE FRONTEND IN PRODUCTION
// if (process.env.NODE_ENV === "production") {
//     app.use(express.static(path.join(__dirname, "/frontend/dist")));
//     app.get("*", (req, res) => {
//         res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
//     });
// }

// app.listen(PORT, () => {
//     console.log(`Server running on port ${PORT}`);
//     connectDB();
// });























// import dotenv from "dotenv";
// dotenv.config();

// import express from "express";
// import cookieParser from "cookie-parser";
// import path from "path";
// import cors from "cors";
// import mongoose from "mongoose";

// import authRoutes from "./routes/auth.route.js";
// import productRoutes from "./routes/product.route.js";
// import cartRoutes from "./routes/cart.route.js";
// import couponRoutes from "./routes/coupon.route.js";
// import paymentRoutes from "./routes/payment.route.js";
// import analyticsRoutes from "./routes/analytics.route.js";
// import categoryRoutes from "./routes/category.route.js";
// import chatbotRoutes from "./routes/chatbot.route.js";
// import { connectDB } from "./lib/db.js";
// import { redis } from "./lib/redis.js";

// const app = express();

// const allowedOrigins = [
//     "http://localhost:5173",
//     "http://localhost:5174",
//     "http://localhost:3000",
//     "https://my-fyp-project-production.up.railway.app",
//     process.env.CLIENT_URL,
// ].filter(Boolean);

// app.use(cors({
//     origin: function (origin, callback) {
//         if (!origin) return callback(null, true);
//         if (allowedOrigins.indexOf(origin) !== -1) {
//             callback(null, true);
//         } else {
//             console.log("CORS blocked origin:", origin);
//             callback(new Error('Not allowed by CORS'));
//         }
//     },
//     credentials: true,
//     allowedHeaders: ['Content-Type', 'Authorization'],
//     methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
// }));

// const PORT = process.env.PORT || 8000;
// const __dirname = path.resolve();

// app.use(express.json({ limit: "10mb" }));
// app.use(cookieParser());

// // ✅ ADD: Health check route (UptimeRobot ke liye)
// app.get("/health", (req, res) => {
//     res.status(200).json({ 
//         status: "ok",
//         timestamp: new Date().toISOString(),
//         uptime: process.uptime()
//     });
// });

// // API Routes
// app.use("/api/auth", authRoutes);
// app.use("/api/products", productRoutes);
// app.use("/api/cart", cartRoutes);
// app.use("/api/coupons", couponRoutes);
// app.use("/api/payments", paymentRoutes);
// app.use("/api/analytics", analyticsRoutes);
// app.use("/api/categories", categoryRoutes);
// app.use("/api/chatbot", chatbotRoutes);

// // SERVE FRONTEND IN PRODUCTION
// if (process.env.NODE_ENV === "production") {
//     app.use(express.static(path.join(__dirname, "/frontend/dist")));
//     app.get("*", (req, res) => {
//         res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
//     });
// }

// app.listen(PORT, () => {
//     console.log(`🚀 Server running on port ${PORT}`);
//     connectDB();
// });







import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cookieParser from "cookie-parser";
import path from "path";
import cors from "cors";
import fs from "fs"; // ✅ ADD

import authRoutes from "./routes/auth.route.js";
import productRoutes from "./routes/product.route.js";
import cartRoutes from "./routes/cart.route.js";
import couponRoutes from "./routes/coupon.route.js";
import paymentRoutes from "./routes/payment.route.js";
import analyticsRoutes from "./routes/analytics.route.js";
import categoryRoutes from "./routes/category.route.js";
import chatbotRoutes from "./routes/chatbot.route.js";
import { connectDB } from "./lib/db.js";

const app = express();

const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:3000",
    "https://my-fyp-project-production.up.railway.app",
    process.env.CLIENT_URL,
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            console.log("CORS blocked origin:", origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
}));

const PORT = process.env.PORT || 8000;
const __dirname = path.resolve();

app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

// ✅ API Routes (SABSE PEHLE - static se pehle)
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/chatbot", chatbotRoutes);

// ✅ Health check
app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok" });
});

// ✅ Static images
app.use("/image", express.static(path.join(__dirname, "frontend", "public", "image")));

// ✅ Frontend serving (production mein)
if (process.env.NODE_ENV === "production") {
    const distPath = path.join(__dirname, "frontend", "dist");
    
    console.log("📁 Checking dist at:", distPath);
    console.log("📁 Dist exists:", fs.existsSync(distPath));
    
    if (fs.existsSync(distPath)) {
        app.use(express.static(distPath));
        
        // SIRF non-API routes ke liye
        app.get("*", (req, res) => {
            if (req.path.startsWith("/api")) {
                return res.status(404).json({ message: "API route not found" });
            }
            res.sendFile(path.join(distPath, "index.html"));
        });
        console.log("✅ Serving frontend from:", distPath);
    } else {
        console.log("⚠️ frontend/dist NOT found! API only mode.");
    }
}

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    connectDB();
});