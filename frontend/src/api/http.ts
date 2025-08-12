import axios from "axios";
import { getToken, clearToken } from "../Utilities/auth";

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL, 
  withCredentials: false,
});

http.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

http.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      clearToken();
    }
    return Promise.reject(err);
  }
);
