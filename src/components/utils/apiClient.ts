import axios, { AxiosInstance, AxiosError } from 'axios';
import Cookies from 'js-cookie';

// ایجاد instance api (اینجا متمرکز)
const api: AxiosInstance = axios.create({
    baseURL: 'https://techlab.studionona.ir/api', // پایه URL
    headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
        // 'X-CSRFTOKEN': 'yYLiwXe7SCQj1onX5G8uvIb808xZmB0PpQZdgAAuBPvG95COi0TkBn4OYbpQ2DQH', // اگر دینامیک نیازه، بعداً آپدیت کن
    },
});

let isRefreshing = false;
let failedQueue: Array<{ resolve: (value: any) => void; reject: (reason?: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// تنظیم اولیه Authorization (اگر توکن از قبل باشه)
api.defaults.headers.common['Authorization'] = `Bearer ${Cookies.get('authToken') || ''}`;

// Response Interceptor
api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as any; // برای _retry

        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then((token) => {
                    originalRequest.headers['Authorization'] = `Bearer ${token}`;
                    return api(originalRequest);
                }).catch(err => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            const refreshToken = Cookies.get('refreshToken');
            if (!refreshToken) {
                processQueue(error, null);
                isRefreshing = false;
                Cookies.remove('authToken', { path: '/' });
                Cookies.remove('refreshToken', { path: '/' });
                window.location.href = '/auth/login';
                return Promise.reject(error);
            }

            try {
                // درخواست refresh (با axios خام، چون ممکنه headerهای instance مشکل‌ساز باشه)
                // اگر CSRF نیازه: headers: { 'X-CSRFTOKEN': Cookies.get('csrftoken') || '' }
                const refreshResponse = await axios.post('https://techlab.studionona.ir/api/account/token/refresh/', {
                    refresh: refreshToken
                });

                const newAccess = refreshResponse.data.access; // فرض { access: 'new' }

                Cookies.set('authToken', newAccess, {
                    expires: 0.020833, // ۳۰ دقیقه
                    secure: true,
                    sameSite: 'strict',
                    path: '/'
                });

                api.defaults.headers.common['Authorization'] = `Bearer ${newAccess}`;
                originalRequest.headers['Authorization'] = `Bearer ${newAccess}`;

                processQueue(null, newAccess);
                isRefreshing = false;
                return api(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);
                isRefreshing = false;
                Cookies.remove('authToken', { path: '/' });
                Cookies.remove('refreshToken', { path: '/' });
                window.location.href = '/auth/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api; // اکسپورت instance