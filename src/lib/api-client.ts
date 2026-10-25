import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "@/store/useAuthStore";

const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export const apiClient: AxiosInstance = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Request Interceptor: Attach JWT Bearer Token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    let token = useAuthStore.getState().token;

    if (!token && typeof window !== "undefined") {
      token = localStorage.getItem("kache_access_token");
    }

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 Unauthorized & token expiration
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear auth state on 401
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

export default apiClient;
