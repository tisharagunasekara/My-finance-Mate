import { Navigate, Outlet } from "react-router-dom";
import Sidebar from "../components/SideBar";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const Layout = () => {
  const { user } = useContext(AuthContext);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 p-6 bg-gray-100 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;
