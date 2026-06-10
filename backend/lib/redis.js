// import Redis from "ioredis";
// import dotenv from "dotenv";

// dotenv.config();

// let redis;

// // ✅ FIX 1: Check BOTH variable names
// const redisUrl = process.env.UPSTASH_REDIS_URL || process.env.REDIS_URL;

// try {
//     if (redisUrl) {
//         redis = new Redis(redisUrl, {
//             // ✅ FIX 2: Proper TLS config for Upstash
//             tls: redisUrl.startsWith('rediss://') 
//                 ? { rejectUnauthorized: false } 
//                 : undefined,
//             retryStrategy: (times) => {
//                 if (times > 3) {
//                     console.log("⚠️ Redis connection failed, using database only");
//                     return null;
//                 }
//                 return Math.min(times * 100, 2000);
//             },
//             maxRetriesPerRequest: 2,
//             connectTimeout: 5000
//         });
//     } else {
//         console.log("⚠️ No Redis URL found, using in-memory fallback");
//         redis = {
//             get: async () => null,
//             set: async () => "OK",
//             setex: async () => "OK",
//             del: async () => 1,
//             flushall: async () => "OK"
//         };
//     }

//     redis.on("connect", () => {
//         console.log("✅ Redis connected");
//     });

//     redis.on("error", (err) => {
//         console.log("⚠️ Redis Error (non-critical):", err.message);
//     });
// } catch (error) {
//     console.log("⚠️ Redis initialization failed, using in-memory fallback");
//     redis = {
//         get: async () => null,
//         set: async () => "OK",
//         setex: async () => "OK",
//         del: async () => 1,
//         flushall: async () => "OK"
//     };
// }

// export { redis };



import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

let redis;
let redisAvailable = false;

// ✅ FIX 1: Check BOTH variable names
const redisUrl = process.env.UPSTASH_REDIS_URL || process.env.REDIS_URL;

const createFallbackRedis = () => ({
    get: async () => null,
    set: async () => "OK",
    setex: async () => "OK",
    del: async () => 1,
    flushall: async () => "OK",
    // ✅ ADD: isReady flag for checking
    isReady: false
});

try {
    if (redisUrl) {
        redis = new Redis(redisUrl, {
            tls: redisUrl.startsWith('rediss://') 
                ? { rejectUnauthorized: false } 
                : undefined,
            retryStrategy: (times) => {
                if (times > 2) {
                    console.log("⚠️ Redis max retries reached, using database only");
                    redisAvailable = false;
                    return null; // Stop retrying
                }
                return Math.min(times * 200, 2000);
            },
            maxRetriesPerRequest: 1,  // ✅ REDUCE: Har request pe kam retry
            connectTimeout: 5000,
            lazyConnect: true  // ✅ ADD: Pehle connect mat karo, jab zaroorat ho tab
        });

        redis.on("connect", () => {
            console.log("✅ Redis connected");
            redisAvailable = true;
        });

        redis.on("error", (err) => {
            console.log("⚠️ Redis Error:", err.message);
            redisAvailable = false;
        });

        redis.on("end", () => {
            console.log("⚠️ Redis connection ended");
            redisAvailable = false;
        });

    } else {
        console.log("⚠️ No Redis URL found, using in-memory fallback");
        redis = createFallbackRedis();
    }
} catch (error) {
    console.log("⚠️ Redis initialization failed:", error.message);
    redis = createFallbackRedis();
}

// ✅ ADD: Helper function to check if Redis is ready
export const isRedisReady = () => redisAvailable && redis.status === 'ready';

export { redis };