import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Navigate } from "react-router-dom";


const Dashboard = () => {
  const auth = useContext(AuthContext);

 if (!auth?.user) {
    return <Navigate to="/signin" />;
}

  return (
    <div> thsi is the dashboard</div>
  );
};

export default Dashboard;