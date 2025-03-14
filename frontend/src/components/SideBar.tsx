import { FaTachometerAlt, FaExchangeAlt, FaChartPie, FaBullseye, FaSignOutAlt } from "react-icons/fa";
import { useState } from "react";

const Sidebar = () => {
  const [active, setActive] = useState("Dashboard");

  const menuItems = [
    { name: "Dashboard", icon: <FaTachometerAlt /> },
    { name: "Transaction", icon: <FaExchangeAlt /> },
    { name: "Budgets", icon: <FaChartPie /> },
    { name: "Financial Goals", icon: <FaBullseye /> },
    { name: "Logout", icon: <FaSignOutAlt /> },
  ];

  return (
    <div className="w-64 h-screen bg-gray-800 text-white flex flex-col p-4">

      <ul className="space-y-4 pt-32">
        {menuItems.map((item) => (
          <li
            key={item.name}
            className={`flex items-center gap-3 px-4 py-2 rounded-lg cursor-pointer transition duration-300 
            ${active === item.name ? "bg-blue-500" : "hover:bg-gray-700"}`}
            onClick={() => setActive(item.name)}
          >
            {item.icon}
            <span>{item.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;