import axios from 'axios';

const api = axios.create({
    // Membaca URL dinamis dari .env.local (lokal/vps)
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://api.medorahealth.cloud/api',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Request Interceptor: Otomatis menempelkan token Bearer
api.interceptors.request.use(
    (config) => {
        const token = typeof window !== 'undefined'
            ? (localStorage.getItem('medora_token') || sessionStorage.getItem('medora_token'))
            : null;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor: Auto-logout jika token expired (401)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            if (typeof window !== 'undefined') {
                localStorage.removeItem('medora_token');
                localStorage.removeItem('medora_user');
                sessionStorage.removeItem('medora_token');
                sessionStorage.removeItem('medora_user');
                window.location.href = '/login'; 
            }
        }
        return Promise.reject(error);
    }
);

export default api;