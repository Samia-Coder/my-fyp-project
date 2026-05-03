import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

let redis;

try {
    if (process.env.REDIS_URL) {
        redis = new Redis(process.env.REDIS_URL, {
            tls: process.env.REDIS_URL.startsWith('rediss://') ? {} : undefined
        });
    } else {
        // 👈 Local Redis ya mock fallback
        redis = new Redis();
    }

    redis.on("connect", () => {
        console.log("✅ Redis connected");
    });

    redis.on("error", (err) => {
        console.log("⚠️ Redis Error (non-critical):", err.message);
    });
} catch (error) {
    console.log("⚠️ Redis not available, using in-memory fallback");
    // Simple in-memory fallback
    redis = {
        get: async () => null,
        set: async () => "OK",
        del: async () => 1
    };
}

export { redis };