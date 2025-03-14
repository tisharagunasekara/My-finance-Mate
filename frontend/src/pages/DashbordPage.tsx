import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

const Dashboard = () => {
  const auth = useContext(AuthContext);

 if (!auth?.user) {
    return <Navigate to="/signin" />;
}

  return <h1 className="text-3xl mt-10 text-center">Welcome to Dashboard</h1>;
};

export default Dashboard;