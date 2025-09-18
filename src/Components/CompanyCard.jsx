// components/CompanyCard.js
"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const CompanyCard = ({ company, currentUser, onPartnershipUpdate }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();

  // Determine if the current user can request partnership
  const canRequestPartnership = () => {
    // If no user is logged in, can't request
    if (!currentUser ) return false;
    
    // If user is a corporate, can't request partnership with other companies
    if (currentUser.role === "Corporate") return false;
    
    // If user is trying to request partnership with their own company
    if (company._id === currentUser.id) return false;
    
    // If already has a partnership request with this company
    if (company.hasPartnershipRequest) return false;
    
    return true;
  };

  const handlePartnershipRequest = async () => {
    if (!session) {
      alert("Please log in to request partnership");
      router.push("/SignInPage");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/partnerships/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // This ensures cookies are sent
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
        // Handle unauthorized error specifically
        if (response.status === 401) {
          alert("Your session has expired. Please log in again.");
          router.push("/SignInPage");
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

  // Show loading state while checking session
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

      {canRequestPartnership() && (
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

      {!session && (
        <div className="w-full bg-gray-100 text-gray-600 py-2 px-4 rounded-md text-center mt-2">
          Please log in to request partnership
        </div>
      )}
    </div>
  );
};

export default CompanyCard;