"use client";

import { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  TagIcon, 
  CurrencyDollarIcon,
  BuildingStorefrontIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  PhotoIcon,
  TrashIcon,
  PencilIcon,
  EyeIcon,
  ClockIcon,
  CheckIcon,
  UsersIcon,
  ChartBarIcon,
  MegaphoneIcon,
  XMarkIcon as XIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';

const MarketingAgencyPackages = () => {
  const [packages, setPackages] = useState([]);
  const [filteredPackages, setFilteredPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showPackageDetails, setShowPackageDetails] = useState(null);
  const [editPackage, setEditPackage] = useState(null);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    duration: '',
    deliverables: [''],
    features: [''],
    targetAudience: '',
    includedServices: [],
    status: 'active',
    images: [],
    newImages: [],
    maxRevisions: '3',
    supportType: 'email',
    successRate: '',
    caseStudies: []
  });

  const categoriesList = [
    "Social Media Marketing",
    "SEO & Content Marketing",
    "PPC Advertising",
    "Email Marketing",
    "Influencer Marketing",
    "Brand Strategy",
    "Web Design & Development",
    "Video Marketing",
    "Complete Digital Marketing",
    "Local SEO"
  ];

  const servicesList = [
    "Strategy Development",
    "Competitor Analysis",
    "Content Creation",
    "Ad Campaign Management",
    "Performance Analytics",
    "Monthly Reporting",
    "Dedicated Account Manager",
    "24/7 Support",
    "A/B Testing",
    "Conversion Optimization"
  ];

  const supportTypes = [
    "email",
    "phone",
    "premium",
    "dedicated"
  ];

  useEffect(() => {
    fetchPackages();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [packages, searchTerm, statusFilter, categoryFilter, sortBy]);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const authToken = localStorage.getItem('authToken');
      
      const response = await fetch('/api/agency/packages', {
        headers: {
          "Content-Type": "application/json",
          ...(authToken && { "Authorization": `Bearer ${authToken}` })
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Fetched packages:', data); // Debug log
        // Make sure we're setting the packages array correctly
        setPackages(data.packages || data || []);
      } else {
        throw new Error('Failed to fetch packages');
      }
    } catch (error) {
      console.error('Error fetching packages:', error);
      toast.error('Failed to load packages');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...packages];

    // Apply search filter
    if (searchTerm) {
      const searchTermLower = searchTerm.toLowerCase();
      filtered = filtered.filter(pkg => {
        const name = pkg.name ? pkg.name.toLowerCase() : '';
        const description = pkg.description ? pkg.description.toLowerCase() : '';
        const category = pkg.category ? pkg.category.toLowerCase() : '';
        const targetAudience = pkg.targetAudience ? pkg.targetAudience.toLowerCase() : '';
        
        return (
          name.includes(searchTermLower) ||
          description.includes(searchTermLower) ||
          category.includes(searchTermLower) ||
          targetAudience.includes(searchTermLower)
        );
      });
    }

    // Apply status filter - add safe access to status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(pkg => (pkg.status || 'active') === statusFilter);
    }

    // Apply category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(pkg => pkg.category === categoryFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        case 'oldest':
          return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
        case 'price-asc':
          return (a.price || 0) - (b.price || 0);
        case 'price-desc':
          return (b.price || 0) - (a.price || 0);
        case 'duration-asc':
          return (a.duration || 0) - (b.duration || 0);
        case 'duration-desc':
          return (b.duration || 0) - (a.duration || 0);
        default:
          return 0;
      }
    });

    setFilteredPackages(filtered);
  };

  // Safe status badge function
  const getStatusBadge = (status) => {
    const actualStatus = status || 'active'; // Default to 'active' if undefined
    const statusColors = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      featured: 'bg-blue-100 text-blue-800'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[actualStatus] || 'bg-gray-100 text-gray-800'}`}>
        {actualStatus}
      </span>
    );
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleServiceChange = (service) => {
    setFormData(prev => ({
      ...prev,
      includedServices: prev.includedServices.includes(service)
        ? prev.includedServices.filter(s => s !== service)
        : [...prev.includedServices, service]
    }));
  };

  const handleDeliverableChange = (index, value) => {
    const newDeliverables = [...formData.deliverables];
    newDeliverables[index] = value;
    setFormData(prev => ({
      ...prev,
      deliverables: newDeliverables
    }));
  };

  const addDeliverable = () => {
    setFormData(prev => ({
      ...prev,
      deliverables: [...prev.deliverables, '']
    }));
  };

  const removeDeliverable = (index) => {
    setFormData(prev => ({
      ...prev,
      deliverables: prev.deliverables.filter((_, i) => i !== index)
    }));
  };

  const handleFeatureChange = (index, value) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData(prev => ({
      ...prev,
      features: newFeatures
    }));
  };

  const addFeature = () => {
    setFormData(prev => ({
      ...prev,
      features: [...prev.features, '']
    }));
  };

  const removeFeature = (index) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    const newImagePreviews = files.map(file => URL.createObjectURL(file));
    
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...newImagePreviews],
      newImages: [...prev.newImages, ...files]
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
        toast.error('Please log in to create a package');
        return;
      }

      const formDataToSend = new FormData();
      
      // Append basic fields
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('price', formData.price);
      formDataToSend.append('duration', formData.duration);
      formDataToSend.append('targetAudience', formData.targetAudience);
      formDataToSend.append('maxRevisions', formData.maxRevisions);
      formDataToSend.append('supportType', formData.supportType);
      formDataToSend.append('successRate', formData.successRate);
      formDataToSend.append('status', formData.status);
      
      // Append arrays
      formDataToSend.append('deliverables', JSON.stringify(formData.deliverables.filter(d => d.trim() !== '')));
      formDataToSend.append('features', JSON.stringify(formData.features.filter(f => f.trim() !== '')));
      formDataToSend.append('includedServices', JSON.stringify(formData.includedServices));

      // Append images
      formData.newImages.forEach((file) => {
        formDataToSend.append('images', file);
      });

      const response = await fetch('/api/agency/packages', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
        body: formDataToSend,
      });

      const result = await response.json();

      if (response.ok) {
        console.log('Package created successfully:', result); // Debug log
        // Make sure we're adding the package correctly
        const newPackage = result.package || result;
        setPackages(prev => [newPackage, ...prev]);
        setShowCreateForm(false);
        resetForm();
        toast.success('Package added successfully!');
      } else {
        throw new Error(result.error || 'Failed to create package');
      }
    } catch (error) {
      console.error('Error creating package:', error);
      toast.error(error.message || 'Failed to add package');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    
    try {
      const authToken = localStorage.getItem('authToken');
      
      if (!authToken) {
        toast.error('Please log in to update a package');
        return;
      }

      const formDataToSend = new FormData();
      
      // Append basic fields
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('price', formData.price);
      formDataToSend.append('duration', formData.duration);
      formDataToSend.append('targetAudience', formData.targetAudience);
      formDataToSend.append('maxRevisions', formData.maxRevisions);
      formDataToSend.append('supportType', formData.supportType);
      formDataToSend.append('successRate', formData.successRate);
      formDataToSend.append('status', formData.status);
      
      // Append arrays
      formDataToSend.append('deliverables', JSON.stringify(formData.deliverables.filter(d => d.trim() !== '')));
      formDataToSend.append('features', JSON.stringify(formData.features.filter(f => f.trim() !== '')));
      formDataToSend.append('includedServices', JSON.stringify(formData.includedServices));
      formDataToSend.append('existingImages', JSON.stringify(formData.images));

      // Append new images
      formData.newImages.forEach((file) => {
        formDataToSend.append('newImages', file);
      });

      const response = await fetch(`/api/agency/packages/${editPackage._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
        body: formDataToSend,
      });

      const result = await response.json();

      if (response.ok) {
        const updatedPackage = result.package || result;
        setPackages(prev => prev.map(p => p._id === editPackage._id ? updatedPackage : p));
        setEditPackage(null);
        resetForm();
        toast.success('Package updated successfully!');
      } else {
        throw new Error(result.error || 'Failed to update package');
      }
    } catch (error) {
      console.error('Error updating package:', error);
      toast.error(error.message || 'Failed to update package');
    }
  };

  const deletePackage = async (packageId) => {
    if (!window.confirm('Are you sure you want to delete this package?')) return;
    
    try {
      const authToken = localStorage.getItem('authToken');
      
      if (!authToken) {
        toast.error('Please log in to delete a package');
        return;
      }

      const response = await fetch(`/api/agency/packages/${packageId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (response.ok) {
        setPackages(prev => prev.filter(p => p._id !== packageId));
        if (showPackageDetails && showPackageDetails._id === packageId) {
          setShowPackageDetails(null);
        }
        toast.success('Package deleted successfully!');
      } else {
        throw new Error(result.error || 'Failed to delete package');
      }
    } catch (error) {
      console.error('Error deleting package:', error);
      toast.error(error.message || 'Failed to delete package');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: '',
      price: '',
      duration: '',
      deliverables: [''],
      features: [''],
      targetAudience: '',
      includedServices: [],
      status: 'active',
      images: [],
      newImages: [],
      maxRevisions: '3',
      supportType: 'email',
      successRate: '',
      caseStudies: []
    });
  };

  const loadPackageForEdit = (pkg) => {
    setFormData({
      name: pkg.name || '',
      description: pkg.description || '',
      category: pkg.category || '',
      price: pkg.price?.toString() || '',
      duration: pkg.duration?.toString() || '',
      deliverables: (pkg.deliverables && pkg.deliverables.length > 0) ? pkg.deliverables : [''],
      features: (pkg.features && pkg.features.length > 0) ? pkg.features : [''],
      targetAudience: pkg.targetAudience || '',
      includedServices: pkg.includedServices || [],
      status: pkg.status || 'active',
      images: pkg.images || [],
      newImages: [],
      maxRevisions: pkg.maxRevisions?.toString() || '3',
      supportType: pkg.supportType || 'email',
      successRate: pkg.successRate?.toString() || '',
      caseStudies: pkg.caseStudies || []
    });
    setEditPackage(pkg);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setCategoryFilter('all');
    setSortBy('newest');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getSupportTypeBadge = (type) => {
    const typeColors = {
      email: 'bg-gray-100 text-gray-800',
      phone: 'bg-blue-100 text-blue-800',
      premium: 'bg-purple-100 text-purple-800',
      dedicated: 'bg-yellow-100 text-yellow-800'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeColors[type] || 'bg-gray-100 text-gray-800'}`}>
        {type}
      </span>
    );
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
          <h1 className="text-2xl font-bold text-gray-800">Marketing Packages</h1>
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
          >
            <PlusIcon className="h-5 w-5" />
            Add Package
          </button>
        </div>

        <p className="text-gray-600">
          Manage your marketing service packages and showcase your expertise to potential clients.
        </p>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white rounded-lg p-6 border shadow-sm">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search packages by name, description, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            <AdjustmentsHorizontalIcon className="h-5 w-5" />
            Filters
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg border">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="featured">Featured</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All Categories</option>
                {categoriesList.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="price-asc">Price (Low to High)</option>
                <option value="price-desc">Price (High to Low)</option>
                <option value="duration-asc">Duration (Short to Long)</option>
                <option value="duration-desc">Duration (Long to Short)</option>
              </select>
            </div>

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

        <div className="flex justify-between items-center mt-4">
          <span className="text-sm text-gray-600">
            Showing {filteredPackages.length} of {packages.length} packages
          </span>
          {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all' ? (
            <span className="text-sm text-purple-600">
              {filteredPackages.length === 0 ? 'No results match your filters' : 'Filtered results'}
            </span>
          ) : null}
        </div>
      </div>

      {/* Packages Grid */}
      <div className="bg-white rounded-lg p-6 border shadow-sm">
        <h2 className="text-xl font-semibold mb-6">
          Marketing Packages ({filteredPackages.length})
          {searchTerm && ` for "${searchTerm}"`}
        </h2>
        
        {filteredPackages.length === 0 ? (
          <div className="text-center py-12">
            <MegaphoneIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              {packages.length === 0 
                ? "No packages added yet." 
                : "No packages match your search criteria."}
            </p>
            {packages.length === 0 && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
              >
                Add Your First Package
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
            {filteredPackages.map((pkg) => (
              <div
                key={pkg._id}
                className={`border rounded-lg p-4 hover:shadow-md transition-shadow relative ${
                  (pkg.status || 'active') === 'inactive' ? 'bg-gray-50 opacity-75' : 'bg-white'
                } ${(pkg.status || 'active') === 'featured' ? 'ring-2 ring-purple-500' : ''}`}
              >
                <div className="h-48 bg-gray-200 rounded-lg mb-4 overflow-hidden">
                  {pkg.images && pkg.images.length > 0 ? (
                    <img
                      src={pkg.images[0]}
                      alt={pkg.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <MegaphoneIcon className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                </div>

                <div className="absolute top-4 right-4">
                  {getStatusBadge(pkg.status)}
                </div>

                <h3 className="font-semibold text-lg mb-2">{pkg.name}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{pkg.description}</p>

                <div className="space-y-2 text-sm mb-3">
                  <div className="flex items-center gap-2 text-gray-600">
                    <TagIcon className="h-4 w-4" />
                    <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">
                      {pkg.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <CurrencyDollarIcon className="h-4 w-4" />
                    <span>${pkg.price?.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <ClockIcon className="h-4 w-4" />
                    <span>{pkg.duration} days</span>
                  </div>
                  {pkg.successRate && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <ChartBarIcon className="h-4 w-4" />
                      <span>{pkg.successRate}% success rate</span>
                    </div>
                  )}
                </div>

                {pkg.features && pkg.features.length > 0 && (
                  <div className="mt-3">
                    <div className="flex flex-wrap gap-1">
                      {pkg.features.slice(0, 3).map((feature, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                        >
                          {feature}
                        </span>
                      ))}
                      {pkg.features.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                          +{pkg.features.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <div className="mt-4 pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">
                      Added {pkg.createdAt ? formatDate(pkg.createdAt) : 'Recently'}
                    </span>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setShowPackageDetails(pkg)}
                        className="text-purple-600 hover:text-purple-800"
                        title="View details"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => loadPackageForEdit(pkg)}
                        className="text-gray-600 hover:text-gray-800"
                        title="Edit"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => deletePackage(pkg._id)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Create/Edit Package Form Modal */}
      {(showCreateForm || editPackage) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">
              {editPackage ? 'Edit Package' : 'Add New Package'}
            </h2>
            <form onSubmit={editPackage ? handleUpdate : handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Package Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500"
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
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Select Category</option>
                    {categoriesList.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
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
                  rows={3}
                  required
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Pricing and Duration */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price ($) *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    min="0"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration (days) *
                  </label>
                  <input
                    type="number"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    required
                    min="1"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Success Rate (%)
                  </label>
                  <input
                    type="number"
                    name="successRate"
                    value={formData.successRate}
                    onChange={handleInputChange}
                    min="0"
                    max="100"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              {/* Target Audience */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Target Audience
                </label>
                <input
                  type="text"
                  name="targetAudience"
                  value={formData.targetAudience}
                  onChange={handleInputChange}
                  placeholder="e.g., Small businesses, E-commerce stores, Startups"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Deliverables */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Key Deliverables
                </label>
                <div className="space-y-2">
                  {formData.deliverables.map((deliverable, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={deliverable}
                        onChange={(e) => handleDeliverableChange(index, e.target.value)}
                        placeholder="e.g., Monthly performance report"
                        className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500"
                      />
                      <button
                        type="button"
                        onClick={() => removeDeliverable(index)}
                        className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addDeliverable}
                    className="flex items-center gap-2 px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                  >
                    <PlusIcon className="h-4 w-4" />
                    Add Deliverable
                  </button>
                </div>
              </div>

              {/* Features */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Key Features
                </label>
                <div className="space-y-2">
                  {formData.features.map((feature, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={feature}
                        onChange={(e) => handleFeatureChange(index, e.target.value)}
                        placeholder="e.g., Real-time analytics dashboard"
                        className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500"
                      />
                      <button
                        type="button"
                        onClick={() => removeFeature(index)}
                        className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addFeature}
                    className="flex items-center gap-2 px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                  >
                    <PlusIcon className="h-4 w-4" />
                    Add Feature
                  </button>
                </div>
              </div>

              {/* Included Services */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Included Services
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {servicesList.map((service) => (
                    <label key={service} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.includedServices.includes(service)}
                        onChange={() => handleServiceChange(service)}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">{service}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Support and Revisions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Support Type
                  </label>
                  <select
                    name="supportType"
                    value={formData.supportType}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500"
                  >
                    {supportTypes.map(type => (
                      <option key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)} Support
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Maximum Revisions
                  </label>
                  <input
                    type="number"
                    name="maxRevisions"
                    value={formData.maxRevisions}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              {/* Photos */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Package Images
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  {formData.images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image}
                        alt={`Package ${index + 1}`}
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
                    <span className="text-sm text-gray-500">Add Images</span>
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

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="featured">Featured</option>
                </select>
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    setEditPackage(null);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                >
                  {editPackage ? 'Update Package' : 'Add Package'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Package Details Modal */}
      {showPackageDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-semibold">Package Details</h2>
              <button
                onClick={() => setShowPackageDetails(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="mb-6">
              {showPackageDetails.images && showPackageDetails.images.length > 0 ? (
                <img
                  src={showPackageDetails.images[0]}
                  alt={showPackageDetails.name}
                  className="w-full h-64 object-cover rounded-lg mb-4"
                />
              ) : (
                <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center mb-4">
                  <MegaphoneIcon className="h-12 w-12 text-gray-400" />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="font-medium text-gray-900">Basic Information</h3>
                <dl className="mt-2 space-y-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Package Name</dt>
                    <dd className="text-sm text-gray-900">{showPackageDetails.name}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Description</dt>
                    <dd className="text-sm text-gray-900">{showPackageDetails.description}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Category</dt>
                    <dd className="text-sm text-gray-900">
                      <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">
                        {showPackageDetails.category}
                      </span>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Status</dt>
                    <dd className="text-sm">
                      {getStatusBadge(showPackageDetails.status)}
                    </dd>
                  </div>
                </dl>
              </div>

              <div>
                <h3 className="font-medium text-gray-900">Pricing & Duration</h3>
                <dl className="mt-2 space-y-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Price</dt>
                    <dd className="text-sm text-gray-900">${showPackageDetails.price?.toLocaleString()}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Duration</dt>
                    <dd className="text-sm text-gray-900">{showPackageDetails.duration} days</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Success Rate</dt>
                    <dd className="text-sm text-gray-900">{showPackageDetails.successRate || 'N/A'}%</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Support Type</dt>
                    <dd className="text-sm">
                      {getSupportTypeBadge(showPackageDetails.supportType)}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            {showPackageDetails.targetAudience && (
              <div className="mb-6">
                <h3 className="font-medium text-gray-900 mb-2">Target Audience</h3>
                <p className="text-sm text-gray-900">{showPackageDetails.targetAudience}</p>
              </div>
            )}

            {showPackageDetails.deliverables && showPackageDetails.deliverables.length > 0 && (
              <div className="mb-6">
                <h3 className="font-medium text-gray-900 mb-2">Key Deliverables</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-900">
                  {showPackageDetails.deliverables.map((deliverable, index) => (
                    <li key={index}>{deliverable}</li>
                  ))}
                </ul>
              </div>
            )}

            {showPackageDetails.features && showPackageDetails.features.length > 0 && (
              <div className="mb-6">
                <h3 className="font-medium text-gray-900 mb-2">Key Features</h3>
                <div className="flex flex-wrap gap-2">
                  {showPackageDetails.features.map((feature, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {showPackageDetails.includedServices && showPackageDetails.includedServices.length > 0 && (
              <div className="mb-6">
                <h3 className="font-medium text-gray-900 mb-2">Included Services</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {showPackageDetails.includedServices.map((service, index) => (
                    <div key={index} className="flex items-center">
                      <CheckIcon className="h-4 w-4 text-green-500 mr-2" />
                      <span className="text-sm text-gray-900">{service}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  loadPackageForEdit(showPackageDetails);
                  setShowPackageDetails(null);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
              >
                <PencilIcon className="h-4 w-4" />
                Edit
              </button>
              <button
                onClick={() => deletePackage(showPackageDetails._id)}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                <TrashIcon className="h-4 w-4" />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketingAgencyPackages;