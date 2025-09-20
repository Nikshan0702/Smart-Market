// components/CompanyCard.js
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const CompanyCard = ({ company, onPartnershipUpdate }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [partnershipStatus, setPartnershipStatus] = useState(null);
  const { data: session, status } = useSession();
  const router = useRouter();

  // Get user data and check partnership status
  useEffect(() => {
    // Check localStorage first
    const userData = localStorage.getItem('userData');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setCurrentUser(parsedUser);
      } catch (error) {
        console.error("Error parsing user data from localStorage:", error);
      }
    } 
    // If no localStorage data but session exists, use session
    else if (session?.user) {
      setCurrentUser(session.user);
    }

    // Check if this company already has a partnership with the current user
    checkPartnershipStatus();
  }, [session, company]);

  // Check partnership status with this company
  const checkPartnershipStatus = async () => {
    if (!currentUser || !currentUser.id || currentUser.role !== "Dealer") return;

    try {
      const authToken = localStorage.getItem('authToken');
      const response = await fetch(`/api/partnerships/status?companyId=${company._id}`, {
        headers: {
          ...(authToken && { "Authorization": `Bearer ${authToken}` }),
        },
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setPartnershipStatus(data.status);
      }
    } catch (error) {
      console.error("Error checking partnership status:", error);
    }
  };

  // Determine if the current user can request partnership
  const canRequestPartnership = () => {
    if (!currentUser || !currentUser.id) return false;
    if (currentUser.role !== "Dealer") return false;
    if (company._id === currentUser.id) return false;
    if (partnershipStatus) return false; // Already has some partnership status
    
    return true;
  };

  const handlePartnershipRequest = async () => {
    if (!currentUser) {
      alert("Please log in to request partnership");
      router.push("/SignInPage");
      return;
    }

    setIsLoading(true);
    try {
      const authToken = localStorage.getItem('authToken');
      
      const response = await fetch("/api/partnerships/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(authToken && { "Authorization": `Bearer ${authToken}` }),
        },
        credentials: "include",
        body: JSON.stringify({
          companyId: company._id,
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        // Handle specific error cases
        if (response.status === 401) {
          alert("Your session has expired. Please log in again.");
          router.push("/SignInPage");
          return;
        }
        if (response.status === 403) {
          alert("Only dealers can request partnerships.");
          return;
        }
        if (response.status === 404) {
          alert("Company not found.");
          return;
        }
        if (response.status === 400) {
          alert(responseData.error || "Partnership request already exists.");
          setPartnershipStatus("pending"); // Update local state
          return;
        }
        throw new Error(responseData.error || `Failed to send partnership request: ${response.status}`);
      }

      alert("Partnership request sent successfully!");
      setPartnershipStatus("pending"); // Update local state
      if (onPartnershipUpdate) {
        onPartnershipUpdate();
      }
    } catch (error) {
      console.error("Error sending partnership request:", error);
      alert(error.message || "Failed to send partnership request");
    } finally {
      setIsLoading(false);
    }
  };

  // Get status display information
  const getStatusInfo = () => {
    switch (partnershipStatus) {
      case "pending":
        return {
          text: "Request Pending",
          color: "bg-yellow-100 text-yellow-800 border-yellow-200",
          icon: "⏳"
        };
      case "approved":
        return {
          text: "Partnership Approved",
          color: "bg-green-100 text-green-800 border-green-200",
          icon: "✅"
        };
      case "rejected":
        return {
          text: "Request Rejected",
          color: "bg-red-100 text-red-800 border-red-200",
          icon: "❌"
        };
      case "blocked":
        return {
          text: "Partnership Blocked",
          color: "bg-gray-100 text-gray-800 border-gray-200",
          icon: "🚫"
        };
      default:
        return null;
    }
  };

  const statusInfo = getStatusInfo();

  // Show loading state while checking session and user data
  if (status === "loading") {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="space-y-2 mb-4">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const canRequest = canRequestPartnership();

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">
          {company.companyDetails?.name || "Unnamed Company"}
        </h2>
        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
          {company.role}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <p className="text-gray-600">
          <span className="font-medium">Industry:</span>{" "}
          {company.companyDetails?.industryType || "Not specified"}
        </p>
        <p className="text-gray-600">
          <span className="font-medium">Contact:</span> {company.firstName}{" "}
          {company.lastName}
        </p>
        <p className="text-gray-600">
          <span className="font-medium">Email:</span> {company.email}
        </p>
        {company.companyDetails?.address && (
          <p className="text-gray-600">
            <span className="font-medium">Location:</span>{" "}
            {company.companyDetails.address.city}, {company.companyDetails.address.country}
          </p>
        )}
      </div>

      {/* Partnership Status Display */}
      {statusInfo && (
        <div className={`w-full py-2 px-4 rounded-md text-center mb-3 border ${statusInfo.color} flex items-center justify-center gap-2`}>
          <span>{statusInfo.icon}</span>
          <span className="font-medium">{statusInfo.text}</span>
        </div>
      )}

      {/* Action Button */}
      {canRequest && (
        <button
          onClick={handlePartnershipRequest}
          disabled={isLoading}
          className={`w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors ${
            isLoading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Sending Request...
            </span>
          ) : (
            "Request Partnership"
          )}
        </button>
      )}

      {currentUser?.role === "Corporate" && (
        <div className="w-full bg-gray-100 text-gray-600 py-2 px-4 rounded-md text-center">
          Companies cannot request partnerships
        </div>
      )}

      {!currentUser && (
        <div className="w-full bg-gray-100 text-gray-600 py-2 px-4 rounded-md text-center">
          Please log in to request partnership
        </div>
      )}
    </div>
  );
};

export default CompanyCard;