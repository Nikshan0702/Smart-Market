// components/CompanyCard.js
"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";

const CompanyCard = ({ company, onPartnershipUpdate }) => {
  const { data: session } = useSession();
  const [partnershipStatus, setPartnershipStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const requestPartnership = async () => {
    if (!session) {
      alert("Please log in to request partnership");
      return;
    }

    if (session.user.role !== "Dealer") {
      alert("Only dealers can request partnerships");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/partnerships/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ companyId: company._id }),
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok) {
        setPartnershipStatus("pending");
        alert("Partnership request sent successfully!");
        if (onPartnershipUpdate) onPartnershipUpdate();
      } else {
        alert(data.error || "Failed to send request");
      }
    } catch (error) {
      console.error("Error requesting partnership:", error);
      alert("An error occurred while sending the request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="p-6">
        <div className="flex items-center mb-4">
          {company.companyDetails?.logo && (
            <img 
              src={company.companyDetails.logo} 
              alt={company.companyDetails.name} 
              className="w-16 h-16 rounded-full object-cover mr-4"
            />
          )}
          <div>
            <h2 className="text-xl font-semibold">
              {company.companyDetails?.name || `${company.firstName} ${company.lastName}`}
            </h2>
            <p className="text-gray-600">{company.companyDetails?.industryType}</p>
          </div>
        </div>
        
        <p className="text-gray-700 mb-4 line-clamp-3">
          {company.companyDetails?.description || "No description available"}
        </p>
        
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm text-gray-500">
            {company.companyDetails?.address
              ? `${company.companyDetails.address.city}, ${company.companyDetails.address.country}`
              : "Location not specified"}
          </span>
          {company.companyDetails?.website && (
            <a 
              href={company.companyDetails.website} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-700 text-sm"
            >
              Visit Website
            </a>
          )}
        </div>
        
        {/* Partnership Request Button */}
        {session?.user?.role  && (
          <button
            onClick={requestPartnership}
            disabled={loading || partnershipStatus}
            className={`w-full py-2 px-4 rounded-md text-white font-medium ${
              loading || partnershipStatus
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading
              ? "Processing..."
              : partnershipStatus === "pending"
              ? "Request Pending"
              : partnershipStatus === "approved"
              ? "Approved"
              : partnershipStatus === "rejected"
              ? "Rejected"
              : "Request Partnership"}
          </button>
        )}
      </div>
    </div>
  );
};

export default CompanyCard;