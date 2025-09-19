// components/CompanyCard.js
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const CompanyCard = ({ company, onPartnershipUpdate }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const { data: session, status } = useSession();
  const router = useRouter();

  // Get user data from both localStorage and session
  useEffect(() => {
    // Check localStorage first
    const userData = localStorage.getItem('userData');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setCurrentUser(parsedUser);
        console.log("User data from localStorage:", parsedUser);
      } catch (error) {
        console.error("Error parsing user data from localStorage:", error);
      }
    } 
    // If no localStorage data but session exists, use session
    else if (session?.user) {
      setCurrentUser(session.user);
      console.log("User data from session:", session.user);
    }
    
    console.log("Session data:", session);
  }, [session]);

  // Add this useEffect to log when currentUser changes
  useEffect(() => {
    console.log("Current User state:", currentUser);
  }, [currentUser]);

  // Determine if the current user can request partnership
  const canRequestPartnership = () => {
    console.log("Checking partnership eligibility:", {
      currentUser,
      companyId: company._id,
      companyRole: company.role,
      hasPartnershipRequest: company.hasPartnershipRequest
    });

    // If no user is logged in, can't request
    if (!currentUser || !currentUser.id) {
      console.log("Cannot request: No current user or user ID");
      return false;
    }
    
    // If user is a corporate, can't request partnership with other companies
    if (currentUser.role === "Corporate") {
      console.log("Cannot request: User is Corporate");
      return false;
    }
    
    // If user is trying to request partnership with their own company
    if (company._id === currentUser.id) {
      console.log("Cannot request: Same company");
      return false;
    }
    
    // If already has a partnership request with this company
    if (company.hasPartnershipRequest) {
      console.log("Cannot request: Already has partnership request");
      return false;
    }
    
    console.log("Can request partnership");
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
      // Get auth token from localStorage
      const authToken = localStorage.getItem('authToken');
      console.log("Auth token from localStorage:", authToken ? "Exists" : "Not found");
      
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

      const responseText = await response.text();
      let responseData;
      
      try {
        responseData = JSON.parse(responseText);
      } catch (e) {
        throw new Error("Invalid response from server");
      }

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
          return;
        }
        throw new Error(responseData.error || `Failed to send partnership request: ${response.status}`);
      }

      alert("Partnership request sent successfully!");
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
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
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
      </div>

      {canRequest && (
        <button
          onClick={handlePartnershipRequest}
          disabled={isLoading}
          className={`w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors ${
            isLoading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {isLoading ? "Sending..." : "Request Partnership"}
        </button>
      )}

      {company.hasPartnershipRequest && (
        <div className="w-full bg-yellow-100 text-yellow-800 py-2 px-4 rounded-md text-center mt-2">
          Partnership Request Sent
        </div>
      )}

      {currentUser?.role === "Corporate" && (
        <div className="w-full bg-gray-100 text-gray-600 py-2 px-4 rounded-md text-center mt-2">
          Companies cannot request partnerships
        </div>
      )}

      {!currentUser && (
        <div className="w-full bg-gray-100 text-gray-600 py-2 px-4 rounded-md text-center mt-2">
          Please log in to request partnership
        </div>
      )}
    </div>
  );
};

export default CompanyCard;