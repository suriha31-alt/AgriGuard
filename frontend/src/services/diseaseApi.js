import axios from 'axios';

// Default base URL fallback (supports both direct FastAPI port 8000 and Express proxy port 5000)
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const api = axios.create({
    baseURL: API_BASE,
    timeout: 30000
});

export const predictCropDisease = async (imageFile, farmerNotes = '') => {
    try {
        const formData = new FormData();
        formData.append('file', imageFile);
        if (farmerNotes) {
            formData.append('notes', farmerNotes);
        }

        const response = await api.post('/api/disease/predict', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });

        return response.data;
    } catch (error) {
        console.error('Disease prediction error:', error);
        throw new Error(
            error.response?.data?.detail || error.message || 'Failed to analyze crop image'
        );
    }
};

export const getPesticideRecommendation = async (crop, disease, rawClass = null) => {
    try {
        const response = await api.post('/api/pesticide/recommend', {
            crop,
            disease,
            raw_class: rawClass
        });
        return response.data;
    } catch (error) {
        console.error('Pesticide recommendation error:', error);
        throw new Error(
            error.response?.data?.detail || error.message || 'Failed to fetch pesticide recommendation'
        );
    }
};

export const saveDiseaseProgress = async (progressData) => {
    try {
        const response = await api.post('/api/disease/progress', progressData);
        return response.data;
    } catch (error) {
        console.error('Save progress error:', error);
        throw new Error(
            error.response?.data?.detail || error.message || 'Failed to log disease progress'
        );
    }
};

export const getDiseaseProgressLogs = async () => {
    try {
        const response = await api.get('/api/disease/progress');
        return response.data;
    } catch (error) {
        console.error('Fetch progress logs error:', error);
        return { success: false, data: [] };
    }
};

export const getAgriGuardAlerts = async () => {
    try {
        const response = await api.get('/api/alerts');
        return response.data;
    } catch (error) {
        console.error('Fetch alerts error:', error);
        return { success: false, data: [] };
    }
};
