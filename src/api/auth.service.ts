import axios from "axios";

const API_URL = "http://localhost:5000/auth";

export const login = async (email: string, password: string) => {
  const response = await axios.post(`${API_URL}/login`, {
    email,
    password,
  });

  return response.data;
};

export const register = async (
  email: string,
  password: string,
  nume: string,
  prenume: string,
) => {
  const response = await axios.post(`${API_URL}/register`, {
    email,
    password,
    firstName: nume,
    lastName: prenume,
  });

  return response.data;
};

export const getCurrentUser = async () => {
  const token = localStorage.getItem("access_token");

  const response = await fetch(`${API_URL}/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Unauthorized");
  }

  return response.json();
};
