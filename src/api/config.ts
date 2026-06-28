import axios from 'axios';
import { loadTokenFromStorage } from '../utils/token';

const apiClient = axios.create({
    // baseURL: 'http://192.168.88.251:8080/api/',
    // baseURL: 'http://10.0.2.2:8080/',
    baseURL: 'http://localhost:8080',
    // baseURL: 'http://192.168.1.191:8080/',
    timeout: 60000, // 60s để xử lý upload ảnh lớn
});

// ─── Request interceptor: gắn JWT Bearer token ───────────────────────────────
apiClient.interceptors.request.use(
    (config) => {
        const token = loadTokenFromStorage();
        if (token && config.headers) {
            config.headers.set('Authorization', `Bearer ${token}`);
        }
        return config;
    },
    (error) => Promise.reject(error),
);

// ─── Response interceptor: xử lý lỗi toàn cục ───────────────────────────────
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                // Import dynamically to avoid circular dependency issues if any
                const { refreshAccessToken, logoutUser } = await import('../services/auth');
                const newAccessToken = await refreshAccessToken();

                if (newAccessToken) {
                    originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
                    return apiClient(originalRequest);
                } else {
                    console.warn('[API] Refresh token failed, logging out');
                    logoutUser();
                    window.location.href = '/auth/login';
                }
            } catch (refreshError) {
                console.error('[API] Error refreshing token', refreshError);
                const { logoutUser } = await import('../services/auth');
                logoutUser();
                window.location.href = '/auth/login';
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    },
);

export default apiClient;