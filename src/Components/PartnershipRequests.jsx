// components/PartnershipRequests.js
"use client";

import { useState } from "react";

const PartnershipRequests = ({ partnerships, loading, onStatusUpdate }) => {
  const [updatingId, setUpdatingId] = useState(null);

  const handleStatusChange = async (partnershipId, status) => {
    setUpdatingId(partnershipId);
    try {
      await onStatusUpdate(partnershipId, status);
    } catch (error) {
      console.error("Error updating partnership:", error);
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Partnership Requests</h2>
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">Partnership Requests</h2>

      {partnerships.length === 0 ? (
        <p className="text-gray-500 text-center py-4">No partnership requests yet.</p>
      ) : (
        <div className="space-y-4">
          {partnerships.map((partnership) => (
            <div
              key={partnership._id}
              className="border rounded-lg p-4 flex justify-between items-center"
            >
              <div>
                <h3 className="font-medium">
                  {partnership.dealer.firstName} {partnership.dealer.lastName}
                </h3>
                <p className="text-sm text-gray-600">{partnership.dealer.email}</p>
                {partnership.dealer.companyDetails?.name && (
                  <p className="text-sm text-gray-600">
                    Company: {partnership.dealer.companyDetails.name}
                  </p>
                )}
                <p className="text-sm text-gray-600">
                  Status:{" "}
                  <span
                    className={`font-medium ${
                      partnership.status === "pending"
                        ? "text-yellow-600"
                        : partnership.status === "approved"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {partnership.status}
                  </span>
                </p>
                <p className="text-xs text-gray-500">
                  Requested: {new Date(partnership.requestedAt).toLocaleDateString()}
                </p>
              </div>

              {partnership.status === "pending" && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleStatusChange(partnership._id, "approved")}
                    disabled={updatingId === partnership._id}
                    className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 disabled:opacity-50"
                  >
                    {updatingId === partnership._id ? "Processing..." : "Approve"}
                  </button>
                  <button
                    onClick={() => handleStatusChange(partnership._id, "rejected")}
                    disabled={updatingId === partnership._id}
                    className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 disabled:opacity-50"
                  >
                    {updatingId === partnership._id ? "Processing..." : "Reject"}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PartnershipRequests;