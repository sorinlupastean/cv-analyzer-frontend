import axios from "axios";

export const http = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000",
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
