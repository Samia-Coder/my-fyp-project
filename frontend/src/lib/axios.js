import axios from "axios";

const axiosInstance = axios.create({
     baseURL: "/api",  // ← Relative URL (same origin)
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

export default axiosInstance;