import { createContext, useState, useEffect, ReactNode } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode"; // Assuming you are using the jwt-decode library
import { logoutUser } from "../services/authService";

interface DecodedToken {
  userId: string;
  exp: number; // Token expiration time (in seconds)
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
  const [loading, setLoading] = useState(true); 

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    console.log("Retrieved token from localStorage:", token);
    if (token) {
      try {
        const decoded: DecodedToken = jwtDecode(token);
        const isTokenExpired = decoded.exp * 10000 < Date.now(); // Convert exp to milliseconds

        if (isTokenExpired) {
          logout(); // Automatically logout if the token is expired
        } else {
          setUser(decoded.userId);
        }
      } catch (error) {
        console.error("Invalid token:", error);
        localStorage.removeItem("accessToken"); // Clear invalid token
      }
    }
    setLoading(false);
  }, []); // Dependency array is empty so it runs only on component mount

  const login = (token: string) => {
    localStorage.setItem("accessToken", token);
    sessionStorage.setItem("accessToken", token);
    try {
      const decoded: DecodedToken = jwtDecode(token);
      setUser(decoded.userId);
    } catch (error) {
      console.error("Invalid token:", error);
    }
  };

  const logout = async () => {
    try {
      await logoutUser(); // Use the service function instead of direct axios call
    } catch (error) {
      console.error("Logout failed:", error);
    }
    localStorage.removeItem("accessToken"); // Optionally clear from sessionStorage if used
    sessionStorage.removeItem("accessToken"); 
    setUser(null); // Clear user from state
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {!loading && children} {/* Don't render until loading is complete */}
    </AuthContext.Provider>
  );
};
