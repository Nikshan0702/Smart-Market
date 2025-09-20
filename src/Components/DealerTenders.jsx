"use client";

import { useState, useEffect } from 'react';
import { 
  EyeIcon, 
  DocumentArrowUpIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  MapPinIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';

const DealerTenders = () => {
  const [tenders, setTenders] = useState([]);
  const [filteredTenders, setFilteredTenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTender, setSelectedTender] = useState(null);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [quoteData, setQuoteData] = useState({
    budget: '',
    notes: '',
    quotationFile: null
  });
  const [uploading, setUploading] = useState(false);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchPartnerTenders();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [tenders, searchTerm, statusFilter, categoryFilter, sortBy]);

  const fetchPartnerTenders = async () => {
    try {
      setLoading(true);
      
      const authToken = localStorage.getItem('authToken');
      const headers = {
        "Content-Type": "application/json",
      };
      
      if (authToken) {
        headers["Authorization"] = `Bearer ${authToken}`;
      }
      
      const response = await fetch('/api/tenders/partnertenders', {
        headers,
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('authToken');
          localStorage.removeItem('userData');
          alert("Your session has expired. Please log in again.");
          window.location.href = "/SignInPage";
          return;
        }
        throw new Error('Failed to fetch tenders');
      }

      const data = await response.json();
      setTenders(data.tenders || []);
    } catch (error) {
      console.error('Error fetching tenders:', error);
      toast.error('Failed to load tenders');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...tenders];

    // Apply search filter
    if (searchTerm) {
      const searchTermLower = searchTerm.toLowerCase();
      filtered = filtered.filter(tender => {
        const title = tender.title ? tender.title.toLowerCase() : '';
        const description = tender.description ? tender.description.toLowerCase() : '';
        const brandName = tender.brandName ? tender.brandName.toLowerCase() : '';
        const category = tender.category ? tender.category.toLowerCase() : '';
        const location = tender.location ? tender.location.toLowerCase() : '';
        
        return (
          title.includes(searchTermLower) ||
          description.includes(searchTermLower) ||
          brandName.includes(searchTermLower) ||
          category.includes(searchTermLower) ||
          location.includes(searchTermLower)
        );
      });
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(tender => {
        if (statusFilter === 'active') {
          return tender.status === 'active' && !isDeadlinePassed(tender.deadline);
        } else if (statusFilter === 'closed') {
          return tender.status === 'closed' || isDeadlinePassed(tender.deadline);
        }
        return tender.status === statusFilter;
      });
    }

    // Apply category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(tender => 
        tender.category && tender.category === categoryFilter
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        case 'oldest':
          return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
        case 'deadline-asc':
          return new Date(a.deadline || 0) - new Date(b.deadline || 0);
        case 'deadline-desc':
          return new Date(b.deadline || 0) - new Date(a.deadline || 0);
        case 'budget-asc':
          return (a.budget || 0) - (b.budget || 0);
        case 'budget-desc':
          return (b.budget || 0) - (a.budget || 0);
        default:
          return 0;
      }
    });

    setFilteredTenders(filtered);
  };

  const viewTenderDetails = (tender) => {
    setSelectedTender(tender);
  };

  const openQuoteModal = (tender) => {
    setSelectedTender(tender);
    setQuoteData({
      budget: '',
      notes: '',
      quotationFile: null
    });
    setShowQuoteModal(true);
  };

  const handleQuoteChange = (e) => {
    const { name, value } = e.target;
    setQuoteData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    setQuoteData(prev => ({
      ...prev,
      quotationFile: e.target.files[0]
    }));
  };

  const submitQuote = async (e) => {
    e.preventDefault();
    
    if (!quoteData.budget || !quoteData.quotationFile) {
      toast.error('Please provide budget and quotation file');
      return;
    }

    setUploading(true);
    
    try {
      const authToken = localStorage.getItem('authToken');
      
      const headers = {
        "Authorization": `Bearer ${authToken}`,
      };
      
      const formData = new FormData();
      formData.append('tenderId', selectedTender._id);
      formData.append('budget', parseFloat(quoteData.budget));
      formData.append('notes', quoteData.notes);
      formData.append('quotationFile', quoteData.quotationFile);
      
      const response = await fetch('/api/tenders/quote', {
        method: 'POST',
        headers,
        credentials: "include",
        body: formData,
      });

      const responseText = await response.text();
      
      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (parseError) {
        console.error("Failed to parse JSON response:", parseError);
        throw new Error(`Server returned invalid JSON: ${responseText.substring(0, 100)}...`);
      }
      
      if (!response.ok) {
        console.error("API error response:", responseData);
        throw new Error(responseData.error || responseData.details || `Failed to submit quote: ${response.status}`);
      }

      const newQuote = responseData;
      
      toast.success('Quote submitted successfully!');
      setShowQuoteModal(false);
      setSelectedTender(null);
      
      fetchPartnerTenders();
      
    } catch (error) {
      console.error('Error submitting quote:', error);
      toast.error(error.message || 'Failed to submit quote');
    } finally {
      setUploading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isDeadlinePassed = (deadline) => {
    return new Date(deadline) < new Date();
  };

  const canQuote = (tender) => {
    return !isDeadlinePassed(tender.deadline) && 
           tender.status === 'active' && 
           !tender.userQuote;
  };

  const getQuoteStatus = (tender) => {
    if (!tender.userQuote) return null;
    
    switch (tender.userQuote.status) {
      case 'submitted':
      case 'pending':
        return { text: 'Pending Review', color: 'text-yellow-600', bg: 'bg-yellow-100', icon: ClockIcon };
      case 'approved':
        return { text: 'Approved', color: 'text-green-600', bg: 'bg-green-100', icon: CheckCircleIcon };
      case 'rejected':
        return { text: 'Rejected', color: 'text-red-600', bg: 'bg-red-100', icon: XCircleIcon };
      default:
        return { text: 'Submitted', color: 'text-blue-600', bg: 'bg-blue-100', icon: DocumentArrowUpIcon };
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setCategoryFilter('all');
    setSortBy('newest');
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg p-6 border shadow-sm">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-gray-100 p-6 rounded-lg h-64"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg p-6 border shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Partner Tenders</h1>
          <div className="text-sm text-gray-600">
            {filteredTenders.length} of {tenders.length} tenders from your partners
          </div>
        </div>

        <p className="text-gray-600">
          View and quote on tender announcements from your partner corporations.
        </p>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white rounded-lg p-6 border shadow-sm">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          {/* Search Input */}
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search tenders by title, description, brand, category, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filter Toggle Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            <AdjustmentsHorizontalIcon className="h-5 w-5" />
            Filters
          </button>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg border">
            {/* Status Filter */}
            {/* <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="closed">Closed</option>
              </select>
            </div> */}

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Categories</option>
                <option value="construction">Construction</option>
                <option value="it">Information Technology</option>
                <option value="supplies">Supplies & Equipment</option>
                <option value="services">Professional Services</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="deadline-asc">Deadline (Earliest)</option>
                <option value="deadline-desc">Deadline (Latest)</option>
                <option value="budget-asc">Budget (Low to High)</option>
                <option value="budget-desc">Budget (High to Low)</option>
              </select>
            </div>

            {/* Clear Filters */}
            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}

        {/* Results Count */}
        <div className="flex justify-between items-center mt-4">
          <span className="text-sm text-gray-600">
            Showing {filteredTenders.length} of {tenders.length} tenders
          </span>
          {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all' ? (
            <span className="text-sm text-blue-600">
              {filteredTenders.length === 0 ? 'No results match your filters' : 'Filtered results'}
            </span>
          ) : null}
        </div>
      </div>

      {/* Tenders Grid */}
      <div className="bg-white rounded-lg p-6 border shadow-sm">
        <h2 className="text-xl font-semibold mb-6">
          Available Tenders ({filteredTenders.length})
          {searchTerm && ` for "${searchTerm}"`}
        </h2>
        
        {filteredTenders.length === 0 ? (
          <div className="text-center py-12">
            <div className="h-12 w-12 text-gray-400 mx-auto mb-4">
              <DocumentArrowUpIcon />
            </div>
            <p className="text-gray-500">
              {tenders.length === 0 
                ? "No active tenders from your partners." 
                : "No tenders match your search criteria."}
            </p>
            <p className="text-gray-400 text-sm mt-2">
              {tenders.length === 0 
                ? "Tenders from your partner corporations will appear here when published."
                : "Try adjusting your search or filters."}
            </p>
            {(searchTerm || statusFilter !== 'all' || categoryFilter !== 'all') && (
              <button
                onClick={clearFilters}
                className="mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTenders.map((tender) => {
              const quoteStatus = getQuoteStatus(tender);
              
              return (
                <div
                  key={tender._id}
                  className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${
                    isDeadlinePassed(tender.deadline) ? 'bg-gray-50 opacity-75' : 'bg-white'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      tender.category === 'construction' ? 'bg-blue-100 text-blue-800' :
                      tender.category === 'it' ? 'bg-purple-100 text-purple-800' :
                      tender.category === 'supplies' ? 'bg-green-100 text-green-800' :
                      tender.category === 'services' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {tender.category}
                    </span>
                    {isDeadlinePassed(tender.deadline) ? (
                      <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                        Closed
                      </span>
                    ) : quoteStatus && (
                      <span className={`px-2 py-1 ${quoteStatus.bg} ${quoteStatus.color} text-xs font-medium rounded-full flex items-center gap-1`}>
                        <quoteStatus.icon className="h-3 w-3" />
                        {quoteStatus.text}
                      </span>
                    )}
                  </div>

                  <h3 className="font-semibold text-lg mb-2">{tender.title}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{tender.description}</p>

                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <CurrencyDollarIcon className="h-4 w-4" />
                      <span>Budget: {tender.budget ? `$${tender.budget}` : 'Not specified'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPinIcon className="h-4 w-4" />
                      <span>{tender.location || 'Location not specified'}</span>
                    </div>
                    <div className={`flex items-center gap-2 ${
                      isDeadlinePassed(tender.deadline) ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      <CalendarIcon className="h-4 w-4" />
                      <span>Deadline: {formatDate(tender.deadline)}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => viewTenderDetails(tender)}
                      className="flex items-center gap-1 px-3 py-1 text-sm text-blue-600 hover:text-blue-800"
                    >
                      <EyeIcon className="h-4 w-4" />
                      View Details
                    </button>
                    
                    {canQuote(tender) && (
                      <button
                        onClick={() => openQuoteModal(tender)}
                        className="flex items-center gap-1 px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                      >
                        <DocumentArrowUpIcon className="h-4 w-4" />
                        Quote
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Tender Details Modal */}
      {selectedTender && !showQuoteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">{selectedTender.title}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <p className="text-gray-900">{selectedTender.category}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Budget</label>
                <p className="text-gray-900">{selectedTender.budget ? `$${selectedTender.budget}` : 'Not specified'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <p className="text-gray-900">{selectedTender.location || 'Not specified'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
                <p className={`${isDeadlinePassed(selectedTender.deadline) ? 'text-red-600' : 'text-gray-900'}`}>
                  {formatDate(selectedTender.deadline)}
                </p>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <p className="text-gray-900 whitespace-pre-wrap">{selectedTender.description}</p>
            </div>

            {selectedTender.requirements && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Requirements</label>
                <p className="text-gray-900 whitespace-pre-wrap">{selectedTender.requirements}</p>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Information</label>
              <p className="text-gray-900">Email: {selectedTender.contactEmail}</p>
              {selectedTender.contactPhone && (
                <p className="text-gray-900">Phone: {selectedTender.contactPhone}</p>
              )}
            </div>

            {/* Quote Status Display */}
            {selectedTender?.userQuote && (
              <div className="mb-4 p-3 rounded-md bg-gray-50">
                <h3 className="font-medium text-gray-700 mb-2">Your Quote Status</h3>
                <div className="flex items-center gap-2">
                  {(() => {
                    const status = getQuoteStatus(selectedTender);
                    const IconComponent = status.icon;
                    return (
                      <>
                        <IconComponent className={`h-5 w-5 ${status.color}`} />
                        <span className={`font-medium ${status.color}`}>
                          {status.text}
                        </span>
                      </>
                    );
                  })()}
                </div>
                {selectedTender.userQuote.notes && (
                  <p className="mt-2 text-sm text-gray-600">
                    <span className="font-medium">Your notes:</span> {selectedTender.userQuote.notes}
                  </p>
                )}
                {selectedTender.userQuote.budget && (
                  <p className="mt-1 text-sm text-gray-600">
                    <span className="font-medium">Your quote:</span> ${selectedTender.userQuote.budget}
                  </p>
                )}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={() => setSelectedTender(null)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Close
              </button>
              {canQuote(selectedTender) && (
                <button
                  onClick={() => openQuoteModal(selectedTender)}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Submit Quote
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Quote Modal */}
      {showQuoteModal && selectedTender && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h2 className="text-xl font-semibold mb-4">Submit Quote for {selectedTender.title}</h2>
            
            <form onSubmit={submitQuote} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Budget ($) *
                </label>
                <input
                  type="number"
                  name="budget"
                  value={quoteData.budget}
                  onChange={handleQuoteChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your proposed budget"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Notes
                </label>
                <textarea
                  name="notes"
                  value={quoteData.notes}
                  onChange={handleQuoteChange}
                  rows={3}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="Add any additional information about your quote..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quotation Document (PDF) *
                </label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Upload your detailed quotation in PDF format
                </p>
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setShowQuoteModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                  disabled={uploading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                  disabled={uploading}
                >
                  {uploading ? 'Submitting...' : 'Submit Quote'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DealerTenders;