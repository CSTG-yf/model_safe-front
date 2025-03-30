import axios from 'axios';
import { useCounterStore } from '@/stores/counterStore';

// 创建 axios 实例
const instance = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
instance.interceptors.request.use(
  (config) => {
    const store = useCounterStore();
    // 只有在用户已登录的情况下才添加 token
    if (store.isLoggedIn()) {
      config.headers.Authorization = `Bearer ${store.access}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
instance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const store = useCounterStore();
    const originalRequest = error.config;

    // 只有在用户已登录且是 401 错误时才尝试刷新 token
    if (error.response.status === 401 && store.isLoggedIn() && store.refresh && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const response = await axios.post('http://127.0.0.1:8000/api/users/token/refresh/', {
          refresh: store.refresh
        });

        const { access } = response.data;
        store.access = access;
        localStorage.setItem('access', access);  // 更新本地存储

        // 更新原始请求的 token
        originalRequest.headers.Authorization = `Bearer ${access}`;
        return instance(originalRequest);
      } catch (refreshError) {
        // 如果刷新 token 失败，清除用户信息并跳转到登录页
        store.clearUserInfo();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default instance; 