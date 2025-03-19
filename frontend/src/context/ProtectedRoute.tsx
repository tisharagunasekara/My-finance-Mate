import { Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useContext(AuthContext); // Get user from context

  // If user is not logged in, redirect to login page
  if (!user) {
    return <Navigate to="/login" />;
  }

  return children; // If logged in, render the child components
};

export default ProtectedRoute;
