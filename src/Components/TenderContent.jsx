"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { 
  PlusIcon, 
  CalendarIcon, 
  CurrencyDollarIcon,
  MapPinIcon,
  ClockIcon,
  DocumentTextIcon,
  TagIcon,
  XMarkIcon,
  CheckIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';

const TendersContent = () => {
  const { data: session, status } = useSession();
  const [tenders, setTenders] = useState([]);
  const [filteredTenders, setFilteredTenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showTenderDetails, setShowTenderDetails] = useState(null);
  const [dealers, setDealers] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    budget: '',
    deadline: '',
    location: '',
    requirements: '',
    contactEmail: '',
    contactPhone: '',
    brandName: '',
    dealers: []
  });

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchTenders();
    fetchPartnershipDealers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [tenders, searchTerm, statusFilter, categoryFilter, sortBy]);

  const fetchTenders = async () => {
    try {
      setLoading(true);
      
      const authToken = localStorage.getItem('authToken');
      
      const headers = {
        "Content-Type": "application/json",
      };
      
      if (authToken) {
        headers["Authorization"] = `Bearer ${authToken}`;
      }
      
      const response = await fetch('/api/tenders', {
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

  const fetchPartnershipDealers = async () => {
    try {
      const authToken = localStorage.getItem('authToken');
      
      const headers = {
        "Content-Type": "application/json",
      };
      
      if (authToken) {
        headers["Authorization"] = `Bearer ${authToken}`;
      }
      
      const response = await fetch('/api/partnerships/approved-dealers', {
        headers,
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setDealers(data.dealers || []);
      }
    } catch (error) {
      console.error('Error fetching dealers:', error);
    }
  };

  const applyFilters = () => {
  let filtered = [...tenders];

  // Apply search filter
  if (searchTerm) {
    const searchTermLower = searchTerm.toLowerCase();
    filtered = filtered.filter(tender => {
      // Safely check each property with null/undefined checks
      const title = tender.title ? tender.title.toLowerCase() : '';
      const description = tender.description ? tender.description.toLowerCase() : '';
      const brandName = tender.brandName ? tender.brandName.toLowerCase() : '';
      const category = tender.category ? tender.category.toLowerCase() : '';
      
      return (
        title.includes(searchTermLower) ||
        description.includes(searchTermLower) ||
        brandName.includes(searchTermLower) ||
        category.includes(searchTermLower)
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
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDealerSelection = (dealerId) => {
    setFormData(prev => {
      if (prev.dealers.includes(dealerId)) {
        return {
          ...prev,
          dealers: prev.dealers.filter(id => id !== dealerId)
        };
      } else {
        return {
          ...prev,
          dealers: [...prev.dealers, dealerId]
        };
      }
    });
  };

  const handleSelectAllDealers = () => {
    if (formData.dealers.length === dealers.length) {
      setFormData(prev => ({
        ...prev,
        dealers: []
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        dealers: dealers.map(dealer => dealer._id)
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const authToken = localStorage.getItem('authToken');
      
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (authToken) {
        headers["Authorization"] = `Bearer ${authToken}`;
      }
      
      const response = await fetch('/api/tenders', {
        method: 'POST',
        headers,
        credentials: "include",
        body: JSON.stringify(formData),
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
        throw new Error(responseData.error || responseData.details || `Failed to create tender: ${response.status}`);
      }

      const newTender = responseData;
      
      setTenders(prev => [newTender, ...prev]);
      setShowCreateForm(false);
      setFormData({
        title: '',
        description: '',
        category: '',
        budget: '',
        deadline: '',
        location: '',
        requirements: '',
        contactEmail: '',
        contactPhone: '',
        brandName: '',
        dealers: []
      });
      toast.success('Tender published successfully!');
    } catch (error) {
      console.error('Error creating tender:', error);
      toast.error(error.message || 'Failed to publish tender');
    }
  };

  const closeTender = async (tenderId) => {
    try {
      const authToken = localStorage.getItem('authToken');
      
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (authToken) {
        headers["Authorization"] = `Bearer ${authToken}`;
      }
      
      const response = await fetch(`/api/tenders/${tenderId}/close`, {
        method: 'PUT',
        headers,
        credentials: "include",
      });

      if (response.ok) {
        const updatedTender = await response.json();
        setTenders(prev => prev.map(t => t._id === tenderId ? updatedTender : t));
        
        if (showTenderDetails && showTenderDetails._id === tenderId) {
          setShowTenderDetails(updatedTender);
        }
        
        toast.success('Tender closed successfully!');
      } else {
        throw new Error('Failed to close tender');
      }
    } catch (error) {
      console.error('Error closing tender:', error);
      toast.error('Failed to close tender');
    }
  };

  const updateQuoteStatus = async (quoteId, status) => {
    try {
      const authToken = localStorage.getItem('authToken');
      
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (authToken) {
        headers["Authorization"] = `Bearer ${authToken}`;
      }
      
      const response = await fetch(`/api/tenders/quote/${quoteId}`, {
        method: 'PUT',
        headers,
        credentials: "include",
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        const updatedQuote = await response.json();
        
        // Update the tender details view
        if (showTenderDetails) {
          const updatedQuotes = showTenderDetails.quotes.map(quote => 
            quote._id === quoteId ? updatedQuote : quote
          );
          setShowTenderDetails({
            ...showTenderDetails,
            quotes: updatedQuotes
          });
        }
        
        toast.success(`Quote ${status} successfully!`);
      } else {
        throw new Error('Failed to update quote status');
      }
    } catch (error) {
      console.error('Error updating quote status:', error);
      toast.error('Failed to update quote status');
    }
  };

  const fetchTenderDetails = async (tenderId) => {
    try {
      const authToken = localStorage.getItem('authToken');
      
      const headers = {
        "Content-Type": "application/json",
      };
      
      if (authToken) {
        headers["Authorization"] = `Bearer ${authToken}`;
      }
      
      const response = await fetch(`/api/tenders/${tenderId}`, {
        headers,
        credentials: "include",
      });

      if (response.ok) {
        const tenderDetails = await response.json();
        setShowTenderDetails(tenderDetails);
      } else {
        throw new Error('Failed to fetch tender details');
      }
    } catch (error) {
      console.error('Error fetching tender details:', error);
      toast.error('Failed to load tender details');
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
          <h1 className="text-2xl font-bold text-gray-800">Tender Management</h1>
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="h-5 w-5" />
            New Tender
          </button>
        </div>

        <p className="text-gray-600">
          Manage and publish tender announcements for your business requirements.
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
              placeholder="Search tenders by title, description, brand, or category..."
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
            <div>
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
                <option value="draft">Draft</option>
              </select>
            </div>

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

      {/* Create Tender Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">Create New Tender</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Category</option>
                    <option value="construction">Construction</option>
                    <option value="it">Information Technology</option>
                    <option value="supplies">Supplies & Equipment</option>
                    <option value="services">Professional Services</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={3}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Brand Name *
                  </label>
                  <input
                    type="text"
                    name="brandName"
                    value={formData.brandName}
                    onChange={handleInputChange}
                    required
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Budget ($)
                  </label>
                  <input
                    type="number"
                    name="budget"
                    value={formData.budget}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Deadline *
                  </label>
                  <input
                    type="date"
                    name="deadline"
                    value={formData.deadline}
                    onChange={handleInputChange}
                    required
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Requirements
                </label>
                <textarea
                  name="requirements"
                    value={formData.requirements}
                    onChange={handleInputChange}
                    rows={2}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    placeholder="List any specific requirements or qualifications..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Dealers
                  </label>
                  <div className="border border-gray-300 rounded-md p-2">
                    <div className="mb-2">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.dealers.length === dealers.length}
                          onChange={handleSelectAllDealers}
                          className="mr-2"
                        />
                        <span>Select All Dealers</span>
                      </label>
                    </div>
                    <div className="max-h-40 overflow-y-auto">
                      {dealers.map(dealer => (
                        <label key={dealer._id} className="flex items-center p-2 hover:bg-gray-100 rounded">
                          <input
                            type="checkbox"
                            checked={formData.dealers.includes(dealer._id)}
                            onChange={() => handleDealerSelection(dealer._id)}
                            className="mr-2"
                          />
                          <span>{dealer.companyDetails?.name || `${dealer.firstName} ${dealer.lastName}`}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Email *
                    </label>
                    <input
                      type="email"
                      name="contactEmail"
                      value={formData.contactEmail}
                      onChange={handleInputChange}
                      required
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Phone
                    </label>
                    <input
                      type="tel"
                      name="contactPhone"
                      value={formData.contactPhone}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="flex gap-3 justify-end pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Publish Tender
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Tender Details Modal */}
        {showTenderDetails && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-semibold">Tender Details</h2>
                <button
                  onClick={() => setShowTenderDetails(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="font-medium text-gray-900">Basic Information</h3>
                  <dl className="mt-2 space-y-2">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Title</dt>
                      <dd className="text-sm text-gray-900">{showTenderDetails.title}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Category</dt>
                      <dd className="text-sm text-gray-900 capitalize">{showTenderDetails.category}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Brand</dt>
                      <dd className="text-sm text-gray-900">{showTenderDetails.brandName}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Description</dt>
                      <dd className="text-sm text-gray-900">{showTenderDetails.description}</dd>
                    </div>
                  </dl>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900">Details</h3>
                  <dl className="mt-2 space-y-2">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Budget</dt>
                      <dd className="text-sm text-gray-900">
                        {showTenderDetails.budget ? `$${showTenderDetails.budget}` : 'Not specified'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Location</dt>
                      <dd className="text-sm text-gray-900">{showTenderDetails.location || 'Not specified'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Deadline</dt>
                      <dd className="text-sm text-gray-900">{formatDate(showTenderDetails.deadline)}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Status</dt>
                      <dd className="text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          showTenderDetails.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {showTenderDetails.status}
                        </span>
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-medium text-gray-900">Requirements</h3>
                <p className="text-sm text-gray-900 mt-2">
                  {showTenderDetails.requirements || 'No specific requirements'}
                </p>
              </div>

              <div className="mb-6">
                <h3 className="font-medium text-gray-900">Targeted Dealers</h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {showTenderDetails.dealers && showTenderDetails.dealers.length > 0 ? (
                    showTenderDetails.dealers.map(dealer => (
                      <span key={dealer._id} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {dealer.companyDetails?.name || `${dealer.firstName} ${dealer.lastName}`}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-gray-500">All partnered dealers</span>
                  )}
                </div>
              </div>

              {showTenderDetails.status === 'active' && (
                <div className="mb-6">
                  <button
                    onClick={() => closeTender(showTenderDetails._id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    Close Tender
                  </button>
                </div>
              )}

              <div>
                <h3 className="font-medium text-gray-900 mb-4">Quotes ({showTenderDetails.quotes?.length || 0})</h3>
                
                {showTenderDetails.quotes && showTenderDetails.quotes.length > 0 ? (
                  <div className="space-y-4">
                    {showTenderDetails.quotes.map(quote => (
                      <div key={quote._id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-medium">{quote.dealer.companyDetails?.name || `${quote.dealer.firstName} ${quote.dealer.lastName}`}</h4>
                            <p className="text-sm text-gray-500">{quote.dealer.email}</p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            quote.status === 'approved' ? 'bg-green-100 text-green-800' :
                            quote.status === 'rejected' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {quote.status}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-3">
                          <div>
                            <span className="text-sm font-medium text-gray-500">Budget:</span>
                            <span className="text-sm text-gray-900 ml-2">${quote.budget}</span>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-500">Submitted:</span>
                            <span className="text-sm text-gray-900 ml-2">{formatDate(quote.createdAt)}</span>
                          </div>
                        </div>
                        
                        {quote.notes && (
                          <div className="mb-3">
                            <span className="text-sm font-medium text-gray-500">Notes:</span>
                            <p className="text-sm text-gray-900 mt-1">{quote.notes}</p>
                          </div>
                        )}
                        
                        {quote.quotationFile && (
                          <div className="mb-3">
                            <a 
                              href={quote.quotationFile} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:text-blue-800"
                            >
                              View Quotation Document
                            </a>
                          </div>
                        )}
                        
                        {showTenderDetails.status === 'active' && quote.status === 'submitted' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => updateQuoteStatus(quote._id, 'approved')}
                              className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => updateQuoteStatus(quote._id, 'rejected')}
                              className="px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No quotes submitted yet.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tenders Grid */}
        <div className="bg-white rounded-lg p-6 border shadow-sm">
        <h2 className="text-xl font-semibold mb-6">
          Published Tenders ({filteredTenders.length})
          {searchTerm && ` for "${searchTerm}"`}
        </h2>
        
        {filteredTenders.length === 0 ? (
          <div className="text-center py-12">
            <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              {tenders.length === 0 
                ? "No tenders published yet." 
                : "No tenders match your search criteria."}
            </p>
            {tenders.length === 0 && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Create Your First Tender
              </button>
            )}
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
            {filteredTenders.map((tender) => (
              <div
                key={tender._id}
                className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${
                  isDeadlinePassed(tender.deadline) || tender.status === 'closed' ? 'bg-gray-50 opacity-75' : 'bg-white'
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
                    {isDeadlinePassed(tender.deadline) || tender.status === 'closed' ? (
                      <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                        Closed
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                        Active
                      </span>
                    )}
                  </div>

                  <h3 className="font-semibold text-lg mb-2">{tender.title}</h3>
                  <p className="text-gray-600 text-sm mb-2">
                    <strong>Brand:</strong> {tender.brandName}
                  </p>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{tender.description}</p>

                  <div className="space-y-2 text-sm">
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

                  <div className="mt-4 pt-4 border-t">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">
                        Published {formatDate(tender.createdAt)}
                      </span>
                      <button 
                        onClick={() => fetchTenderDetails(tender._id)}
                        className="text-blue-600 text-sm font-medium hover:text-blue-800"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
};

export default TendersContent;