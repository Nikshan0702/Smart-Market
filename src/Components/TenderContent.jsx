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
  TagIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';

const TendersContent = () => {
  const { data: session, status } = useSession();
  const [tenders, setTenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    budget: '',
    deadline: '',
    location: '',
    requirements: '',
    contactEmail: '',
    contactPhone: ''
  });

  useEffect(() => {
    fetchTenders();
  }, []);

  const fetchTenders = async () => {
    try {
      setLoading(true);
      
      // Get auth token from localStorage for custom auth
      const authToken = localStorage.getItem('authToken');
      
      const headers = {
        "Content-Type": "application/json",
      };
      
      // Add authorization header if token exists
      if (authToken) {
        headers["Authorization"] = `Bearer ${authToken}`;
      }
      
      const response = await fetch('/api/tenders', {
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      console.log("Submitting tender form:", formData);
      
      // Get auth token from localStorage for custom auth
      const authToken = localStorage.getItem('authToken');
      
      const headers = {
        'Content-Type': 'application/json',
      };
      
      // Add authorization header if token exists
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
      console.log("Raw API response:", responseText);
      
      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (parseError) {
        console.error("Failed to parse JSON response:", parseError);
        throw new Error(`Server returned invalid JSON: ${responseText.substring(0, 100)}...`);
      }
      
      if (!response.ok) {
        console.error("API error response:", responseData);
        throw new Error(responseData.error || responseData.details || `Failed to create tender: ${response.status}`);
      }

      const newTender = responseData;
      console.log("Tender created successfully:", newTender);
      
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
        contactPhone: ''
      });
      toast.success('Tender published successfully!');
    } catch (error) {
      console.error('Error creating tender:', error);
      toast.error(error.message || 'Failed to publish tender');
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

      {/* Tenders Grid */}
      <div className="bg-white rounded-lg p-6 border shadow-sm">
        <h2 className="text-xl font-semibold mb-6">Published Tenders ({tenders.length})</h2>
        
        {tenders.length === 0 ? (
          <div className="text-center py-12">
            <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No tenders published yet.</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Create Your First Tender
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tenders.map((tender) => (
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
                  {isDeadlinePassed(tender.deadline) && (
                    <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                      Closed
                    </span>
                  )}
                </div>

                <h3 className="font-semibold text-lg mb-2">{tender.title}</h3>
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
                    <button className="text-blue-600 text-sm font-medium hover:text-blue-800">
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