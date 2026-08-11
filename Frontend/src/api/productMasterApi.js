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

export const getAllProducts = () => apiClient.get("/product-master");
export const createProduct = (data) => apiClient.post("/product-master", data);
export const updateProduct = (id, data) => apiClient.put(`/product-master/${id}`, data);
export const deleteProduct = (id) => apiClient.delete(`/product-master/${id}`);
export const getProductConfigDetails = (productId) => apiClient.get(`/product-config-details/${productId}`);
export const saveProductConfigDetails = (productId, data) => apiClient.post(`/product-config-details/${productId}`, data);

export const getProductConfigPricing = (productId) => apiClient.get(`/product-config-pricing/${productId}`);
export const saveProductConfigPricing = (productId, data) => apiClient.post(`/product-config-pricing/${productId}`, data);

export const getProductConfigModule = (productId) => apiClient.get(`/product-config-module/${productId}`);
export const saveProductConfigModule = (productId, data) => apiClient.post(`/product-config-module/${productId}`, data);

export const getProductConfigCustomFields = (productId) => apiClient.get(`/product-config-customfields/${productId}`);
export const saveProductConfigCustomFields = (productId, data) => apiClient.post(`/product-config-customfields/${productId}`, data);

export const getProductConfigOptions = (productId) => apiClient.get(`/product-config-options/${productId}`);
export const saveProductConfigOptions = (productId, data) => apiClient.post(`/product-config-options/${productId}`, data);

export const getProductConfigUpgrades = (productId) => apiClient.get(`/product-config-upgrades/${productId}`);
export const saveProductConfigUpgrades = (productId, data) => apiClient.post(`/product-config-upgrades/${productId}`, data);

export const getProductConfigCrossSells = (productId) => apiClient.get(`/product-config-crosssells/${productId}`);
export const saveProductConfigCrossSells = (productId, data) => apiClient.post(`/product-config-crosssells/${productId}`, data);

export const getProductConfigLinks = (productId) => apiClient.get(`/product-config-links/${productId}`);
export const saveProductConfigLinks = (productId, data) => apiClient.post(`/product-config-links/${productId}`, data);


