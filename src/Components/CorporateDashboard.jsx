// components/CorporateDashboard.js
"use client";

import { useState, useEffect } from "react";
import PartnershipRequests from "./PartnershipRequests";

const CorporateDashboard = () => {
  const [partnerships, setPartnerships] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPartnershipRequests();
  }, []);

  const fetchPartnershipRequests = async () => {
    try {
      // Get auth token from localStorage for custom auth
      const authToken = localStorage.getItem('authToken');

      const headers = {
        "Content-Type": "application/json",
      };
      
      // Add authorization header if token exists
      if (authToken) {
        headers["Authorization"] = `Bearer ${authToken}`;
      }
      
      const response = await fetch("/api/partnerships/companyrequests", {
        headers,
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Clear invalid token and redirect to login
          localStorage.removeItem('authToken');
          localStorage.removeItem('userData');
          alert("Your session has expired. Please log in again.");
          window.location.href = "/SignInPage";
          return;
        }
        throw new Error("Failed to fetch partnership requests");
      }

      const data = await response.json();
      setPartnerships(data.partnerships || []);
    } catch (error) {
      console.error("Error fetching partnership requests:", error);
      alert("Failed to load partnership requests");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (partnershipId, status) => {
    try {
      // Get auth token from localStorage for custom auth
      const authToken = localStorage.getItem('authToken');
      
      const headers = {
        "Content-Type": "application/json",
      };
      
      // Add authorization header if token exists
      if (authToken) {
        headers["Authorization"] = `Bearer ${authToken}`;
      }
      
      const response = await fetch("/api/partnerships/updatestatus", {
        method: "PUT",
        headers,
        credentials: "include",
        body: JSON.stringify({ partnershipId, status }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update partnership status");
      }

      // Refresh the partnership requests
      await fetchPartnershipRequests();
    } catch (error) {
      console.error("Error updating partnership status:", error);
      alert(error.message || "Failed to update partnership status");
      throw error;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Corporate Dashboard</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <PartnershipRequests
            partnerships={partnerships}
            loading={loading}
            onStatusUpdate={handleStatusUpdate}
          />
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Stats</h2>
          <div className="space-y-4">
            <div>
              <p className="text-gray-600">Total Partnership Requests</p>
              <p className="text-2xl font-bold">{partnerships.length}</p>
            </div>
            <div>
              <p className="text-gray-600">Pending Requests</p>
              <p className="text-2xl font-bold">
                {partnerships.filter((p) => p.status === "pending").length}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Approved Dealers</p>
              <p className="text-2xl font-bold">
                {partnerships.filter((p) => p.status === "approved").length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CorporateDashboard;