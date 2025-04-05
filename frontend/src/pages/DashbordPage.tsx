import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Navigate } from "react-router-dom";
import { FaSackDollar, FaHandHoldingDollar, FaFileInvoiceDollar } from "react-icons/fa6";
import Tile from "../components/TIle";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { data1, data, COLORS } from "../dummuData/sampleData";

const Dashboard = () => {
  const auth = useContext(AuthContext);

  if (!auth?.user) {
    return <Navigate to="/signin" />;
  }

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <Tile 
            title="Total Income" 
            count={1500} 
            icon={FaFileInvoiceDollar} 
            className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border-b-4 border-green-500"
          />
          <Tile 
            title="Total Expense" 
            count={1200} 
            icon={FaHandHoldingDollar} 
            className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border-b-4 border-red-500"
          />
          <Tile 
            title="Net Worth" 
            count={300} 
            icon={FaSackDollar} 
            className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border-b-4 border-blue-500"
          />
        </div>
        
        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Income & Expense Chart Card */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-xl font-semibold text-gray-700 mb-6 flex items-center">
              <span className="w-2 h-6 bg-indigo-500 rounded-full mr-3"></span>
              Income and Expense
            </h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data1}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {data1.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={COLORS[index % COLORS.length]} 
                        stroke="none"
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `$${value}`} />
                  <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Revenue Breakdown Chart Card */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-xl font-semibold text-gray-700 mb-6 flex items-center">
              <span className="w-2 h-6 bg-purple-500 rounded-full mr-3"></span>
              Revenue Breakdown
            </h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {data.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={COLORS[index % COLORS.length]} 
                        stroke="none"
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `$${value}`} />
                  <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;