import axios from "axios";
const API_URL = "http://localhost:5000/api/auth";


export const registerUser = async (username: string, email: string, password: string) => {
  return axios.post(`${API_URL}/register`, { username, email, password });
};


export const loginUser = async (email: string, password: string) => {
  console.log(email, password);
  return axios.post(`${API_URL}/login`, { email, password });
};
