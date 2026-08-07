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

export const getGeneralConfig = () => apiClient.get("/system-settings/general");
export const updateGeneralConfig = (data) => apiClient.put("/system-settings/general", data);

export const uploadSystemLogo = (formData) => apiClient.post("/system-settings/upload-logo", formData, {
    headers: { "Content-Type": "multipart/form-data" }
});

export const getAllBatches = () => apiClient.get("/system-settings/batches");
export const createBatch = (data) => apiClient.post("/system-settings/batches", data);
export const deleteBatch = (id) => apiClient.delete(`/system-settings/batches/${id}`);
