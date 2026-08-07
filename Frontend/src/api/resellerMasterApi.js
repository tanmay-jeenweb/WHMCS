import axios from "axios";
import { getDeviceId } from "../utils/device";

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
    withCredentials: true
});

apiClient.interceptors.request.use(async (config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    try {
        const deviceId = await getDeviceId();
        if (deviceId) {
            config.headers["x-device-id"] = deviceId;
            config.headers["device-id"] = deviceId;
        }
    } catch (error) {
        console.error("Failed to resolve device id", error);
    }

    const methodLower = config.method ? config.method.toLowerCase() : "";
    if (methodLower === "put" || methodLower === "delete" || methodLower === "patch") {
        config.headers["X-HTTP-Method-Override"] = methodLower.toUpperCase();
        config.method = "post";
    }

    return config;
}, (error) => Promise.reject(error));

export const getResellerConfig = () => apiClient.get("/reseller-master/config");
export const updateResellerConfig = (data) => apiClient.put("/reseller-master/config", data);

export const getAllResellerAccounts = () => apiClient.get("/reseller-master/accounts");
export const createResellerAccount = (data) => apiClient.post("/reseller-master/accounts", data);
export const deleteResellerAccount = (id) => apiClient.delete(`/reseller-master/accounts/${id}`);
