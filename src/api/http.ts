import axios from "axios";

export const http = axios.create({
  baseURL: process.env.REACT_APP_API_URL, // ex: http://localhost:3001
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem("token"); // dacă folosești JWT
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
