"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import ProfileContent from "./ProfileContent";
import TenderContent from "./TenderContent";
import CorporateDashboard from "./CorporateDashboard";
import CompanyList from "./CompanyList";
import DealerTenders from "./DealerTenders";

// Define user roles
const USER_ROLES = {
  CORPORATE: "Corporate",
  DEALER: "Dealer",
  ADMIN: "Admin",
  MARKETING_AGENCY: "MarketingAgency"
};

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

// Component for each navigation item
const DashboardContent = () => (
  <div>
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

const TendersContent = ({ userRole }) => (
  <div>
    {userRole === USER_ROLES.CORPORATE ? <TenderContent /> : <DealerTenders />}
  </div>
);

const ProfileWrapper = () => (
  <div>
    <ProfileContent />
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
  const router = useRouter();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Get user data from localStorage on component mount
  useEffect(() => {
    const checkAuthentication = () => {
      const authToken = localStorage.getItem('authToken');
      const userData = localStorage.getItem('userData');
      
      if (!authToken || !userData) {
        // Redirect to login if not authenticated
        router.push('/SignInPage');
        return;
      }
      
      try {
        const user = JSON.parse(userData);
        
        // Extract only simple values, not complex objects
        const safeUser = {
          name: user.name || 'User',
          role: user.role || USER_ROLES.CORPORATE,
          company: typeof user.company === 'object' ? user.company.name : user.company || 'DATTREO',
          // Add other simple properties only
        };
        
        setCurrentUser(safeUser);
      } catch (error) {
        console.error('Error parsing user data:', error);
        router.push('/SignInPage');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthentication();
  }, [router]);

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    localStorage.removeItem('rememberMe');
    router.push('/SignInPage');
  };

  const renderContent = () => {
    if (!currentUser) return null;
    
    const selectedComponent = mainMenuItems[selectedIndex].component;
    
    switch (selectedComponent) {
      case "Dashboard":
        return currentUser.role === USER_ROLES.CORPORATE 
          ? <CorporateDashboard /> 
          : <CompanyList />;
      case "Invoices":
        return <InvoicesContent />;
      case "Tenders":
        return <TendersContent userRole={currentUser.role} />;
      case "Profile":
        return <ProfileWrapper />;        
      case "Blogs":
        return <Blogs />;
      default:
        return <DashboardContent />;
    }
  };

  // Generate initials from user name
  const getUserInitials = () => {
    if (!currentUser?.name) return 'U';
    return currentUser.name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1976d2] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Show nothing if not authenticated (will redirect)
  if (!currentUser) {
    return null;
  }

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

          {/* User Profile */}
          <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1976d2] text-white text-sm font-semibold">
              {getUserInitials()}
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-800">{currentUser.name || 'User'}</p>
              <p className="text-xs text-gray-500">
                {currentUser.role} · {currentUser.company || 'DATTREO'}
              </p>
            </div>
            <button onClick={handleLogout} className="text-gray-500 hover:text-gray-700">
              <ArrowRightOnRectangleIcon className="h-5 w-5" />
            </button>
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
              {getUserInitials()}
            </div>
          </div>
        </div>

        {/* Dynamic Content */}
        {renderContent()}
      </main>
    </div>
  );
}