import axios from 'axios';

const API_BASE = 'http://localhost:5000/api/products';

export const getProductsOverview = () => {
    return axios.get(`${API_BASE}/overview`, { withCredentials: true });
};

export const createProductGroup = (groupData) => {
    return axios.post(`${API_BASE}/groups`, groupData, { withCredentials: true });
};

export const createProduct = (productData) => {
    return axios.post(`${API_BASE}/products`, productData, { withCredentials: true });
};

export const duplicateProduct = (duplicateData) => {
    return axios.post(`${API_BASE}/products/duplicate`, duplicateData, { withCredentials: true });
};

export const refreshFeatureStatus = () => {
    return axios.post(`${API_BASE}/refresh-status`, {}, { withCredentials: true });
};

export const createAddon = (addonData) => {
    return axios.post(`${API_BASE}/addons`, addonData, { withCredentials: true });
};

export const clearProductsData = () => {
    return axios.post(`${API_BASE}/clear`, {}, { withCredentials: true });
};
