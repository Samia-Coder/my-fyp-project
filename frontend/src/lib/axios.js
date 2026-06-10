import axios from "axios";

const axiosInstance = axios.create({
     baseURL: "https://my-fyp-project-production.up.railway.app/api",  // ← Relative URL (same origin)
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

export default axiosInstance;