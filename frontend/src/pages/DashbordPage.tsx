import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Navigate } from "react-router-dom";
import {FaSackDollar ,FaHandHoldingDollar,FaFileInvoiceDollar} from "react-icons/fa6";
import Tile from "../components/TIle";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
//import sample dummy data

import {data1, data,COLORS } from "../dummuData/sampleData";

const Dashboard = () => {
  const auth = useContext(AuthContext);

 if (!auth?.user) {
    return <Navigate to="/signin" />;
}

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
    <div className="flex justify-center gap-8 mb-8">
      <Tile title="Total Income" count={1500} icon={FaFileInvoiceDollar} />
      <Tile title="Total Expense" count={1200} icon={FaHandHoldingDollar} />
      <Tile title="Net Worth" count={300} icon={FaSackDollar} />
    </div>

    <div className="flex flex-col md:flex-row justify-center items-center gap-12 p-8 ">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-700 mb-4">Income and Expense</h2>
        <PieChart width={300} height={300} className="mx-auto">
          <Pie
            data={data1}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
            label
          >
            {data1.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </div>

      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-700 mb-4">Revenue Breakdown</h2>
        <PieChart width={300} height={300} className="mx-auto">
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
            label
          >
            {data1.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </div>
    </div>
  </div>

  );
};

export default Dashboard;