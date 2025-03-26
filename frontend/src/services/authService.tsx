import axios from "axios";

// Define the base URL for all API calls
const API_URL = "http://localhost:5001/api/auth";

// Register a new user
export const registerUser = async (username: string, email: string, password: string) => {
  return await axios.post(`${API_URL}/register`, {
    username,
    email,
    password,
  });
};

// Login a user
export const loginUser = async (email: string, password: string) => {
  return await axios.post(`${API_URL}/login`, {
    email,
    password,
  }, { withCredentials: true });
};

// Refresh the access token
export const refreshToken = async () => {
  return await axios.post(`${API_URL}/refresh`, {}, { withCredentials: true });
};

// Logout a user
export const logoutUser = async () => {
  return await axios.post(`${API_URL}/logout`, {}, { withCredentials: true });
};
