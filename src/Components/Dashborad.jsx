"use client";

import { useState } from "react";
import Blogs from "@/DigitalMarketing/Blogs";
import {
  Bars3Icon,
  BellIcon,
  ChevronRightIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  UserCircleIcon,
  MagnifyingGlassIcon,
  DocumentDuplicateIcon,
  DocumentTextIcon,
  UserIcon,
  NewspaperIcon,
  HomeIcon,
  CreditCardIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";

const mainMenuItems = [
  { 
    text: "Dashboard", 
    icon: <HomeIcon className="h-5 w-5" />,
    component: "Dashboard"
  },
  { 
    text: "Invoices", 
    icon: <CreditCardIcon className="h-5 w-5" />,
    component: "Invoices"
  },
  { 
    text: "Tenders", 
    icon: <ClipboardDocumentListIcon className="h-5 w-5" />,
    component: "Tenders"
  },
  { 
    text: "My Profile", 
    icon: <UserIcon className="h-5 w-5" />,
    component: "Profile"
  },
  { 
    text: "Blogs", 
    icon: <NewspaperIcon className="h-5 w-5" />,
    component: "Blogs"
  },
];

const teamMenuItems = [
  { text: "Heroicons", color: "#1976d2" },
  { text: "Tailwind Labs", color: "#dc004e" },
  { text: "Workcotton", color: "#2e7d32" },
];

// Component for each navigation item
const DashboardContent = () => (
  <div>
    {/* Welcome Card */}
    <div className="bg-gradient-to-r from-blue-50 to-white border border-blue-100 rounded-lg p-5 mb-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-1">
        Welcome back, Nikshan 👋
      </h2>
      <p className="text-sm text-gray-600">Here's your dashboard overview</p>
    </div>

    {/* Stats */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {[
        { value: "12", label: "Active Projects", color: "#1976d2", icon: "📋" },
        { value: "8", label: "Team Members", color: "#dc004e", icon: "👥" },
        { value: "24", label: "Completed Tasks", color: "#2e7d32", icon: "✅" },
        { value: "3", label: "Upcoming Events", color: "#ed6c02", icon: "📅" },
      ].map((stat, i) => (
        <div
          key={i}
          className="bg-white p-4 rounded-lg border shadow-sm flex items-center"
        >
          <div
            className="h-11 w-11 flex items-center justify-center rounded-md mr-3 text-lg"
            style={{ backgroundColor: `${stat.color}15` }}
          >
            {stat.icon}
          </div>
          <div>
            <p
              className="text-xl font-semibold"
              style={{ color: stat.color }}
            >
              {stat.value}
            </p>
            <p className="text-xs text-gray-500">{stat.label}</p>
          </div>
        </div>
      ))}
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Recent Activity */}
      <div className="lg:col-span-2 bg-white rounded-lg p-5 border shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-gray-800">Recent Activity</h3>
          <button className="text-sm text-[#1976d2] hover:underline">
            View all
          </button>
        </div>
        <div className="bg-gray-50 p-5 rounded-md h-48 flex items-center justify-center text-gray-400 italic">
          Your recent projects and activities will appear here
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg p-5 border shadow-sm">
        <h3 className="font-semibold text-gray-800 mb-4">Quick Actions</h3>
        <div className="flex flex-col gap-2">
          <button className="w-full py-2 text-sm border rounded-md hover:bg-gray-50">
            Create New Project
          </button>
          <button className="w-full py-2 text-sm border rounded-md hover:bg-gray-50">
            Invite Team Members
          </button>
          <button className="w-full py-2 text-sm border rounded-md hover:bg-gray-50">
            Generate Reports
          </button>
        </div>
      </div>
    </div>
  </div>
);

const InvoicesContent = () => (
  <div>
    <div className="bg-white rounded-lg p-6 border shadow-sm mb-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Invoices</h2>
      <div className="bg-gray-50 p-8 rounded-md text-center">
        <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500 italic">Invoice management will appear here</p>
      </div>
    </div>
  </div>
);

const TendersContent = () => (
  <div>
    <div className="bg-white rounded-lg p-6 border shadow-sm mb-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Tenders</h2>
      <div className="bg-gray-50 p-8 rounded-md text-center">
        <ClipboardDocumentListIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500 italic">Tender management will appear here</p>
      </div>
    </div>
  </div>
);

const ProfileContent = () => (
  <div>
    <div className="bg-white rounded-lg p-6 border shadow-sm mb-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">My Profile</h2>
      <div className="bg-gray-50 p-8 rounded-md text-center">
        <UserIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500 italic">Profile settings will appear here</p>
      </div>
    </div>
  </div>
);

const BlogsContent = () => (
  <div>
    <div className="bg-white rounded-lg p-6 border shadow-sm mb-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Blogs</h2>
      <div className="bg-gray-50 p-8 rounded-md text-center">
        <NewspaperIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500 italic">Blog management will appear here</p>
      </div>
    </div>
  </div>
);

export default function Dashboard() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const renderContent = () => {
    const selectedComponent = mainMenuItems[selectedIndex].component;
    
    switch (selectedComponent) {
      case "Dashboard":
        return <DashboardContent />;
      case "Invoices":
        return <InvoicesContent />;
      case "Tenders":
        return <TendersContent />;
      case "Profile":
        return <ProfileContent />;
      case "Blogs":
        return <Blogs />;
      default:
        return <DashboardContent />;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-0'} bg-white border-r border-gray-200 shadow-sm transition-all duration-300 overflow-hidden`}>
        <div className="p-4 font-bold text-lg text-gray-800">DATTREO</div>
        <nav className="px-3">
          <ul>
            {mainMenuItems.map((item, i) => (
              <li key={i}>
                <button
                  onClick={() => setSelectedIndex(i)}
                  className={`flex w-full items-center gap-3 px-3 py-2.5 rounded-md text-sm ${
                    selectedIndex === i
                      ? "bg-[#1976d2] text-white"
                      : "text-gray-600 hover:bg-blue-50"
                  }`}
                >
                  <span
                    className={`${
                      selectedIndex === i ? "text-white" : "text-gray-500"
                    }`}
                  >
                    {item.icon}
                  </span>
                  {item.text}
                  {selectedIndex === i && (
                    <ChevronRightIcon className="ml-auto h-4 w-4 opacity-80" />
                  )}
                </button>
              </li>
            ))}
          </ul>

          <div className="my-6 border-t border-gray-200"></div>

          <p className="px-2 mb-2 text-xs font-semibold text-gray-500">
            YOUR TEAMS
          </p>
          <div className="flex flex-wrap gap-2 px-2">
            {teamMenuItems.map((team) => (
              <span
                key={team.text}
                className="px-2 py-1 rounded-full text-xs font-medium border"
                style={{
                  color: team.color,
                  backgroundColor: `${team.color}15`,
                  borderColor: `${team.color}30`,
                }}
              >
                {team.text}
              </span>
            ))}
          </div>

          <div className="my-6 border-t border-gray-200"></div>

          {/* User Profile */}
          <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1976d2] text-white text-sm font-semibold">
              TC
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-800">Tom Cook</p>
              <p className="text-xs text-gray-500">Admin · DATTREO</p>
            </div>
            <Cog6ToothIcon className="h-5 w-5 text-gray-500" />
          </div>
        </nav>
      </aside>

      {/* Main */}
      <main className="flex-1 p-6">
        {/* Top Bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4 flex-1">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-md text-gray-500 hover:bg-gray-100"
            >
              <Bars3Icon className="h-5 w-5" />
            </button>

            {/* Search */}
            <div className="flex items-center w-72 h-9 bg-gray-50 border border-gray-200 rounded-md px-2">
              <MagnifyingGlassIcon className="h-4 w-4 text-gray-500" />
              <input
                placeholder="Search..."
                className="flex-1 bg-transparent text-sm px-2 outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-md text-gray-500 hover:bg-gray-100">
              <BellIcon className="h-5 w-5" />
              <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                4
              </span>
            </button>
            <div className="h-9 w-9 flex items-center justify-center rounded-full bg-[#1976d2] text-white text-sm font-semibold">
              TC
            </div>
          </div>
        </div>

        {/* Dynamic Content */}
        {renderContent()}
      </main>
    </div>
  );
}