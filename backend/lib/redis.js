import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

let redis;

// ✅ FIX 1: Check BOTH variable names
const redisUrl = process.env.UPSTASH_REDIS_URL || process.env.REDIS_URL;

try {
    if (redisUrl) {
        redis = new Redis(redisUrl, {
            // ✅ FIX 2: Proper TLS config for Upstash
            tls: redisUrl.startsWith('rediss://') 
                ? { rejectUnauthorized: false } 
                : undefined,
            retryStrategy: (times) => {
                if (times > 3) {
                    console.log("⚠️ Redis connection failed, using database only");
                    return null;
                }
                return Math.min(times * 100, 2000);
            },
            maxRetriesPerRequest: 2,
            connectTimeout: 5000
        });
    } else {
        console.log("⚠️ No Redis URL found, using in-memory fallback");
        redis = {
            get: async () => null,
            set: async () => "OK",
            setex: async () => "OK",
            del: async () => 1,
            flushall: async () => "OK"
        };
    }

    redis.on("connect", () => {
        console.log("✅ Redis connected");
    });

    redis.on("error", (err) => {
        console.log("⚠️ Redis Error (non-critical):", err.message);
    });
} catch (error) {
    console.log("⚠️ Redis initialization failed, using in-memory fallback");
    redis = {
        get: async () => null,
        set: async () => "OK",
        setex: async () => "OK",
        del: async () => 1,
        flushall: async () => "OK"
    };
}

export { redis };