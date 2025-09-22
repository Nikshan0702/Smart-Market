"use client";

import { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  MapPinIcon, 
  ArrowsPointingOutIcon, 
  CurrencyDollarIcon,
  BuildingStorefrontIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  PhotoIcon,
  TrashIcon,
  PencilIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';

const DealerWarehouse = () => {
  const [warehouses, setWarehouses] = useState([]);
  const [filteredWarehouses, setFilteredWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showWarehouseDetails, setShowWarehouseDetails] = useState(null);
  const [editWarehouse, setEditWarehouse] = useState(null);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [amenityFilter, setAmenityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    totalArea: '',
    availableArea: '',
    dailyRate: '',
    minBookingDays: '1',
    amenities: [],
    status: 'active',
    images: [],
    newImages: [] // Store actual File objects for new uploads
  });

  const amenitiesList = [
    "24/7 Access",
    "Security Cameras",
    "Climate Control",
    "Loading Dock",
    "Forklift Available",
    "Pallets Provided",
    "Insurance Included",
    "Parking Available",
    "Electrical Outlets",
    "Restrooms"
  ];

  useEffect(() => {
    fetchWarehouses();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [warehouses, searchTerm, statusFilter, amenityFilter, sortBy]);

  const fetchWarehouses = async () => {
    try {
      setLoading(true);
      const authToken = localStorage.getItem('authToken');
      
      const headers = {
        "Content-Type": "application/json",
      };
      
      if (authToken) {
        headers["Authorization"] = `Bearer ${authToken}`;
      }
      
      const response = await fetch('/api/warehouses/dealer', {
        headers,
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setWarehouses(data.warehouses || []);
      } else {
        throw new Error('Failed to fetch warehouses');
      }
    } catch (error) {
      console.error('Error fetching warehouses:', error);
      toast.error('Failed to load warehouses');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...warehouses];

    // Apply search filter
    if (searchTerm) {
      const searchTermLower = searchTerm.toLowerCase();
      filtered = filtered.filter(warehouse => {
        const name = warehouse.name ? warehouse.name.toLowerCase() : '';
        const description = warehouse.description ? warehouse.description.toLowerCase() : '';
        const address = warehouse.address ? warehouse.address.toLowerCase() : '';
        const city = warehouse.city ? warehouse.city.toLowerCase() : '';
        
        return (
          name.includes(searchTermLower) ||
          description.includes(searchTermLower) ||
          address.includes(searchTermLower) ||
          city.includes(searchTermLower)
        );
      });
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(warehouse => warehouse.status === statusFilter);
    }

    // Apply amenity filter
    if (amenityFilter !== 'all') {
      filtered = filtered.filter(warehouse => 
        warehouse.amenities && warehouse.amenities.includes(amenityFilter)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        case 'oldest':
          return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
        case 'rate-asc':
          return (a.dailyRate || 0) - (b.dailyRate || 0);
        case 'rate-desc':
          return (b.dailyRate || 0) - (a.dailyRate || 0);
        case 'size-asc':
          return (a.availableArea || 0) - (b.availableArea || 0);
        case 'size-desc':
          return (b.availableArea || 0) - (a.availableArea || 0);
        default:
          return 0;
      }
    });

    setFilteredWarehouses(filtered);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAmenityChange = (amenity) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    // Create preview URLs for display
    const newImagePreviews = files.map(file => URL.createObjectURL(file));
    
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...newImagePreviews],
      newImages: [...prev.newImages, ...files] // Store actual File objects
    }));
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
      newImages: prev.newImages.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  
  try {
    const authToken = localStorage.getItem('authToken');
    
    if (!authToken) {
      toast.error('Please log in to create a warehouse');
      return;
    }

    // Create FormData object
    const formDataToSend = new FormData();
    
    // Append all form fields
    formDataToSend.append('name', formData.name);
    formDataToSend.append('description', formData.description);
    formDataToSend.append('address', formData.address);
    formDataToSend.append('city', formData.city);
    formDataToSend.append('state', formData.state);
    formDataToSend.append('zipCode', formData.zipCode);
    formDataToSend.append('totalArea', formData.totalArea);
    formDataToSend.append('availableArea', formData.availableArea);
    formDataToSend.append('dailyRate', formData.dailyRate);
    formDataToSend.append('minBookingDays', formData.minBookingDays);
    formDataToSend.append('amenities', JSON.stringify(formData.amenities));
    formDataToSend.append('status', formData.status);

    // Append image files
    formData.newImages.forEach((file, index) => {
      formDataToSend.append('images', file);
    });

    // ✅ REMOVE Content-Type header - let browser set it automatically
    const response = await fetch('/api/warehouses', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        // ❌ Remove this line: 'Content-Type': 'application/json',
      },
      body: formDataToSend, // FormData will set the correct Content-Type
    });

    const result = await response.json();

    if (response.ok) {
      setWarehouses(prev => [result.warehouse, ...prev]);
      setShowCreateForm(false);
      resetForm();
      toast.success('Warehouse added successfully!');
    } else {
      throw new Error(result.error || 'Failed to create warehouse');
    }
  } catch (error) {
    console.error('Error creating warehouse:', error);
    toast.error(error.message || 'Failed to add warehouse');
  }
};

  const handleUpdate = async (e) => {
    e.preventDefault();
    
    try {
      const authToken = localStorage.getItem('authToken');
      
      if (!authToken) {
        toast.error('Please log in to update a warehouse');
        return;
      }

      // Create FormData object
      const formDataToSend = new FormData();
      
      // Append all form fields
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('address', formData.address);
      formDataToSend.append('city', formData.city);
      formDataToSend.append('state', formData.state);
      formDataToSend.append('zipCode', formData.zipCode);
      formDataToSend.append('totalArea', formData.totalArea);
      formDataToSend.append('availableArea', formData.availableArea);
      formDataToSend.append('dailyRate', formData.dailyRate);
      formDataToSend.append('minBookingDays', formData.minBookingDays);
      formDataToSend.append('amenities', JSON.stringify(formData.amenities));
      formDataToSend.append('status', formData.status);
      formDataToSend.append('existingImages', JSON.stringify(formData.images));

      // Append new image files
      formData.newImages.forEach((file, index) => {
        formDataToSend.append('newImages', file);
      });

      const response = await fetch(`/api/warehouses/${editWarehouse._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
        body: formDataToSend,
      });

      const result = await response.json();

      if (response.ok) {
        setWarehouses(prev => prev.map(w => w._id === editWarehouse._id ? result.warehouse : w));
        setEditWarehouse(null);
        resetForm();
        toast.success('Warehouse updated successfully!');
      } else {
        throw new Error(result.error || 'Failed to update warehouse');
      }
    } catch (error) {
      console.error('Error updating warehouse:', error);
      toast.error(error.message || 'Failed to update warehouse');
    }
  };

  const deleteWarehouse = async (warehouseId) => {
    if (!window.confirm('Are you sure you want to delete this warehouse?')) return;
    
    try {
      const authToken = localStorage.getItem('authToken');
      
      if (!authToken) {
        toast.error('Please log in to delete a warehouse');
        return;
      }

      const response = await fetch(`/api/warehouses/${warehouseId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (response.ok) {
        setWarehouses(prev => prev.filter(w => w._id !== warehouseId));
        if (showWarehouseDetails && showWarehouseDetails._id === warehouseId) {
          setShowWarehouseDetails(null);
        }
        toast.success('Warehouse deleted successfully!');
      } else {
        throw new Error(result.error || 'Failed to delete warehouse');
      }
    } catch (error) {
      console.error('Error deleting warehouse:', error);
      toast.error(error.message || 'Failed to delete warehouse');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      totalArea: '',
      availableArea: '',
      dailyRate: '',
      minBookingDays: '1',
      amenities: [],
      status: 'active',
      images: [],
      newImages: []
    });
  };

  const loadWarehouseForEdit = (warehouse) => {
    setFormData({
      name: warehouse.name || '',
      description: warehouse.description || '',
      address: warehouse.address || '',
      city: warehouse.city || '',
      state: warehouse.state || '',
      zipCode: warehouse.zipCode || '',
      totalArea: warehouse.totalArea?.toString() || '',
      availableArea: warehouse.availableArea?.toString() || '',
      dailyRate: warehouse.dailyRate?.toString() || '',
      minBookingDays: warehouse.minBookingDays?.toString() || '1',
      amenities: warehouse.amenities || [],
      status: warehouse.status || 'active',
      images: warehouse.images || [],
      newImages: []
    });
    setEditWarehouse(warehouse);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setAmenityFilter('all');
    setSortBy('newest');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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
          <h1 className="text-2xl font-bold text-gray-800">Warehouse Management</h1>
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#288984] text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="h-5 w-5" />
            Add Warehouse
          </button>
        </div>

        <p className="text-gray-600">
          Manage your warehouse spaces and availability for corporate clients.
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
              placeholder="Search warehouses by name, description, or location..."
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
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {/* Amenity Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amenity
              </label>
              <select
                value={amenityFilter}
                onChange={(e) => setAmenityFilter(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Amenities</option>
                {amenitiesList.map(amenity => (
                  <option key={amenity} value={amenity}>{amenity}</option>
                ))}
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
                <option value="rate-asc">Rate (Low to High)</option>
                <option value="rate-desc">Rate (High to Low)</option>
                <option value="size-asc">Size (Small to Large)</option>
                <option value="size-desc">Size (Large to Small)</option>
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
            Showing {filteredWarehouses.length} of {warehouses.length} warehouses
          </span>
          {searchTerm || statusFilter !== 'all' || amenityFilter !== 'all' ? (
            <span className="text-sm text-blue-600">
              {filteredWarehouses.length === 0 ? 'No results match your filters' : 'Filtered results'}
            </span>
          ) : null}
        </div>
      </div>

      {/* Create/Edit Warehouse Form Modal */}
      {(showCreateForm || editWarehouse) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">
              {editWarehouse ? 'Edit Warehouse' : 'Add New Warehouse'}
            </h2>
            <form onSubmit={editWarehouse ? handleUpdate : handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Warehouse Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Daily Rate ($) *
                  </label>
                  <input
                    type="number"
                    name="dailyRate"
                    value={formData.dailyRate}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.01"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address *
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ZIP Code *
                  </label>
                  <input
                    type="text"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    required
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Area (sqft) *
                  </label>
                  <input
                    type="number"
                    name="totalArea"
                    value={formData.totalArea}
                    onChange={handleInputChange}
                    required
                    min="0"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Available Area (sqft) *
                  </label>
                  <input
                    type="number"
                    name="availableArea"
                    value={formData.availableArea}
                    onChange={handleInputChange}
                    required
                    min="0"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Minimum Booking Days *
                  </label>
                  <input
                    type="number"
                    name="minBookingDays"
                    value={formData.minBookingDays}
                    onChange={handleInputChange}
                    required
                    min="1"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amenities & Features
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {amenitiesList.map((amenity) => (
                    <label key={amenity} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.amenities.includes(amenity)}
                        onChange={() => handleAmenityChange(amenity)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">{amenity}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Photos
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  {formData.images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image}
                        alt={`Warehouse ${index + 1}`}
                        className="h-32 w-full object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  
                  <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400">
                    <PhotoIcon className="h-8 w-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-500">Add Photos</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    setEditWarehouse(null);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#288984] text-white rounded-md hover:bg-blue-700"
                >
                  {editWarehouse ? 'Update Warehouse' : 'Add Warehouse'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Warehouse Details Modal */}
      {showWarehouseDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-semibold">Warehouse Details</h2>
              <button
                onClick={() => setShowWarehouseDetails(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="mb-6">
              {showWarehouseDetails.images && showWarehouseDetails.images.length > 0 ? (
                <img
                  src={showWarehouseDetails.images[0]}
                  alt={showWarehouseDetails.name}
                  className="w-full h-64 object-cover rounded-lg mb-4"
                />
              ) : (
                <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center mb-4">
                  <PhotoIcon className="h-12 w-12 text-gray-400" />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="font-medium text-gray-900">Basic Information</h3>
                <dl className="mt-2 space-y-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Name</dt>
                    <dd className="text-sm text-gray-900">{showWarehouseDetails.name}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Description</dt>
                    <dd className="text-sm text-gray-900">{showWarehouseDetails.description || 'No description'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Status</dt>
                    <dd className="text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        showWarehouseDetails.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {showWarehouseDetails.status}
                      </span>
                    </dd>
                  </div>
                </dl>
              </div>

              <div>
                <h3 className="font-medium text-gray-900">Location Details</h3>
                <dl className="mt-2 space-y-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Address</dt>
                    <dd className="text-sm text-gray-900">{showWarehouseDetails.address}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">City</dt>
                    <dd className="text-sm text-gray-900">{showWarehouseDetails.city}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">ZIP Code</dt>
                    <dd className="text-sm text-gray-900">{showWarehouseDetails.zipCode}</dd>
                  </div>
                </dl>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="font-medium text-gray-900">Space Details</h3>
                <dl className="mt-2 space-y-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Total Area</dt>
                    <dd className="text-sm text-gray-900">{showWarehouseDetails.totalArea} sqft</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Available Area</dt>
                    <dd className="text-sm text-gray-900">{showWarehouseDetails.availableArea} sqft</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Daily Rate</dt>
                    <dd className="text-sm text-gray-900">${showWarehouseDetails.dailyRate}/day</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Minimum Booking</dt>
                    <dd className="text-sm text-gray-900">{showWarehouseDetails.minBookingDays} days</dd>
                  </div>
                </dl>
              </div>

              {showWarehouseDetails.amenities && showWarehouseDetails.amenities.length > 0 && (
                <div>
                  <h3 className="font-medium text-gray-900">Amenities</h3>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {showWarehouseDetails.amenities.map((amenity, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  loadWarehouseForEdit(showWarehouseDetails);
                  setShowWarehouseDetails(null);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <PencilIcon className="h-4 w-4" />
                Edit
              </button>
              <button
                onClick={() => deleteWarehouse(showWarehouseDetails.id)}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                <TrashIcon className="h-4 w-4" />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Warehouses Grid */}
      <div className="bg-white rounded-lg p-6 border shadow-sm">
        <h2 className="text-xl font-semibold mb-6">
          My Warehouses ({filteredWarehouses.length})
          {searchTerm && ` for "${searchTerm}"`}
        </h2>
        
        {filteredWarehouses.length === 0 ? (
          <div className="text-center py-12">
            <BuildingStorefrontIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              {warehouses.length === 0 
                ? "No warehouses added yet." 
                : "No warehouses match your search criteria."}
            </p>
            {warehouses.length === 0 && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Add Your First Warehouse
              </button>
            )}
            {(searchTerm || statusFilter !== 'all' || amenityFilter !== 'all') && (
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
            {filteredWarehouses.map((warehouse) => (
              <div
                key={warehouse.id}
                className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${
                  warehouse.status === 'inactive' ? 'bg-gray-50 opacity-75' : 'bg-white'
                }`}
              >
                <div className="h-48 bg-gray-200 rounded-lg mb-4 overflow-hidden">
                  {warehouse.images && warehouse.images.length > 0 ? (
                    <img
                      src={warehouse.images[0]}
                      alt={warehouse.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <BuildingStorefrontIcon className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                  
                  
                </div>

                <h3 className="font-semibold text-lg mb-2">{warehouse.name}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{warehouse.description}</p>

                {/* <div className="absolute top-4 right-4"> */}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      warehouse.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {warehouse.status}
                    </span>
                  {/* </div> */}

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPinIcon className="h-4 w-4" />
                    <span>{warehouse.city}, {warehouse.state}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <ArrowsPointingOutIcon className="h-4 w-4" />
                    <span>{warehouse.availableArea} sqft available</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <CurrencyDollarIcon className="h-4 w-4" />
                    <span>${warehouse.dailyRate}/day</span>
                  </div>
                </div>

                {warehouse.amenities && warehouse.amenities.length > 0 && (
                  <div className="mt-3">
                    <div className="flex flex-wrap gap-1">
                      {warehouse.amenities.slice(0, 3).map((amenity, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                        >
                          {amenity}
                        </span>
                      ))}
                      {warehouse.amenities.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                          +{warehouse.amenities.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <div className="mt-4 pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">
                      Added {formatDate(warehouse.createdAt)}
                    </span>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setShowWarehouseDetails(warehouse)}
                        className="text-blue-600 hover:text-blue-800"
                        title="View details"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => loadWarehouseForEdit(warehouse)}
                        className="text-gray-600 hover:text-gray-800"
                        title="Edit"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                    </div>
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

export default DealerWarehouse;