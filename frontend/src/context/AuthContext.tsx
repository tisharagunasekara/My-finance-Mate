import { createContext, useState, useEffect, ReactNode } from "react";
import axios from "axios";
import {jwtDecode} from "jwt-decode";

interface DecodedToken {
  userId: string;
}

interface AuthContextType {
  user: string | null;
  login: (token: string) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      try {
        const decoded: DecodedToken = jwtDecode<DecodedToken>(token);
        setUser(decoded.userId);
      } catch (error) {
        console.error("Invalid token:", error);
        localStorage.removeItem("accessToken"); // Clear invalid token
      }
    }
  }, []);

  const login = (token: string) => {
    localStorage.setItem("accessToken", token);
    try {
      const decoded: DecodedToken = jwtDecode<DecodedToken>(token);
      setUser(decoded.userId);
    } catch (error) {
      console.error("Invalid token:", error);
    }
  };

  const logout = async () => {
    try {
      await axios.post("http://localhost:5000/api/auth/logout", {}, { withCredentials: true });
    } catch (error) {
      console.error("Logout failed:", error);
    }
    localStorage.removeItem("accessToken");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
