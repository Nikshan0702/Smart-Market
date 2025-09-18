// components/CompanyList.js
"use client";

import { useState, useEffect } from "react";
import CompanyCard from "./CompanyCard";
// import SearchBar from "./SearchBar";
// import Pagination from "./Pagination";

const CompanyList = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchCompanies();
  }, [currentPage, searchTerm]);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: currentPage,
        limit: 9,
        ...(searchTerm && { search: searchTerm }),
      });

      const response = await fetch(`/api/companies?${queryParams}`, {
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch companies");
      }

      const data = await response.json();
      setCompanies(data.companies);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error("Error fetching companies:", error);
      alert("Failed to load companies");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Registered Companies</h1>

      {/* <SearchBar onSearch={handleSearch} placeholder="Search companies..." /> */}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : companies.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            {searchTerm
              ? "No companies found matching your search."
              : "No companies registered yet."}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {companies.map((company) => (
              <CompanyCard
                key={company._id}
                company={company}
                onPartnershipUpdate={fetchCompanies}
              />
            ))}
          </div>

          {/* <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          /> */}
        </>
      )}
    </div>
  );
};

export default CompanyList;