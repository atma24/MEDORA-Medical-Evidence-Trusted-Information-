import axios from 'axios';

// Bikin instance axios dengan baseURL Laravel kamu
const api = axios.create({
    baseURL: 'http://localhost:8000/api', // Disesuaikan dengan backend URL kamu
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Request Interceptor: Otomatis nambahin Token ke setiap request (kalau udah login)
api.interceptors.request.use(
    (config) => {
        // Baca token dari localStorage (Remember Me) atau sessionStorage (tanpa Remember Me)
        const token = typeof window !== 'undefined'
            ? (localStorage.getItem('medora_token') || sessionStorage.getItem('medora_token'))
            : null;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor: Otomatis nendang user ke /login kalau token expired (401)
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response && error.response.status === 401) {
            // Kalau unauthorized, hapus token dan tendang ke halaman login
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