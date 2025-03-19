import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

interface ProtectedDivProps {
  children: React.ReactNode;
  className?: string;
}

const ProtectedDiv = ({ children, className }: ProtectedDivProps) => {
  const { user } = useContext(AuthContext);

  // If the user is not authenticated, redirect to the login page
  if (!user) {
    return <Navigate to="/SignIn" />;
  }

  // If authenticated, render the children inside the div with the optional className
  return <div className={className}>{children}</div>;
};

export default ProtectedDiv;
