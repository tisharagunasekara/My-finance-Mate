import { FaTachometerAlt, FaExchangeAlt, FaChartPie, FaBullseye, FaSignOutAlt, FaSignInAlt, FaUserPlus } from "react-icons/fa";
import { NavLink } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const Sidebar = () => {
  const { user, logout } = useContext(AuthContext);

  const authMenuItems = [
    { name: "Dashboard", path: "/", icon: <FaTachometerAlt /> },
    { name: "Transaction", path: "/transaction", icon: <FaExchangeAlt /> },
    { name: "Budgets", path: "/budgets", icon: <FaChartPie /> },
    { name: "Financial Goals", path: "/goals", icon: <FaBullseye /> },
    { name: "Logout", path: "/login", icon: <FaSignOutAlt />, action: logout },
  ];

  const guestMenuItems = [
    { name: "Login", path: "/login", icon: <FaSignInAlt /> },
    { name: "Register", path: "/register", icon: <FaUserPlus /> },
  ];

  const menuItems = user ? authMenuItems : guestMenuItems;

  return (
    <div className="w-64 h-screen bg-gray-800 text-white flex flex-col p-4">
      <ul className="space-y-4 pt-32">
        {menuItems.map((item) => (
          <li key={item.name}>
            <NavLink
              to={item.path}
              //onClick={item.action}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2 rounded-lg cursor-pointer transition duration-300 
                ${isActive ? "bg-blue-500" : "hover:bg-gray-700"}`
              }
            >
              {item.icon}
              <span>{item.name}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
