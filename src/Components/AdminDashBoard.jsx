"use client"
import { Home, Users, BarChart, Settings } from "lucide-react";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, Tooltip } from "recharts";

const data = [
  { name: "Users", value: 400 },
  { name: "Orders", value: 300 },
  { name: "Revenue", value: 300 }
];
const COLORS = ["#0088FE", "#00C49F", "#FFBB28"];

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="w-64 h-screen bg-gray-900 text-white flex flex-col p-4">
        <h2 className="text-2xl font-bold mb-8">Admin</h2>
        <nav className="flex flex-col gap-4">
          <a href="#" className="flex items-center gap-2 hover:text-blue-400"><Home size={20}/> Dashboard</a>
          <a href="#" className="flex items-center gap-2 hover:text-blue-400"><Users size={20}/> Users</a>
          <a href="#" className="flex items-center gap-2 hover:text-blue-400"><BarChart size={20}/> Reports</a>
          <a href="#" className="flex items-center gap-2 hover:text-blue-400"><Settings size={20}/> Settings</a>
        </nav>
      </div>

      {/* Main Section */}
      <div className="flex-1 flex flex-col">
        {/* Navbar */}
        <div className="w-full h-16 bg-white shadow flex items-center justify-between px-6">
          <h1 className="text-xl font-bold">Admin Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="font-medium">Admin</span>
            <img src="https://i.pravatar.cc/40" alt="avatar" className="w-10 h-10 rounded-full"/>
          </div>
        </div>

        {/* Content */}
        <main className="p-6 bg-gray-100 flex-1">
          <h2 className="text-2xl font-bold mb-6">Overview</h2>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <motion.div whileHover={{ scale: 1.05 }} className="bg-white p-6 rounded-2xl shadow">
              <h3 className="text-gray-600">Users</h3>
              <p className="text-2xl font-bold">1,245</p>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} className="bg-white p-6 rounded-2xl shadow">
              <h3 className="text-gray-600">Revenue</h3>
              <p className="text-2xl font-bold">$23,000</p>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} className="bg-white p-6 rounded-2xl shadow">
              <h3 className="text-gray-600">Orders</h3>
              <p className="text-2xl font-bold">320</p>
            </motion.div>
          </div>

          {/* Chart */}
          <div className="bg-white p-6 rounded-2xl shadow w-full md:w-[500px]">
            <h3 className="text-lg font-bold mb-4">Stats</h3>
            <PieChart width={400} height={300}>
              <Pie data={data} dataKey="value" outerRadius={100} fill="#8884d8" label>
                {data.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </div>
        </main>
      </div>
    </div>
  );
}
