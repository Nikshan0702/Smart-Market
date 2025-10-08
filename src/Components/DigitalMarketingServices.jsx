"use client";

import { useState, useEffect } from 'react';
import { 
  MagnifyingGlassIcon,
  BuildingStorefrontIcon,
  TvIcon,
  ShareIcon,
  PaintBrushIcon,
  CurrencyDollarIcon,
  StarIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  GlobeAltIcon,
  CheckIcon,
  XMarkIcon,
  FunnelIcon,
  TagIcon,
  ClockIcon,
  ChartBarIcon,
  MegaphoneIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { toast } from 'react-toastify';

const DigitalMarketingServices = () => {
  const [agencies, setAgencies] = useState([]);
  const [filteredAgencies, setFilteredAgencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAgency, setSelectedAgency] = useState(null);
  const [showAgencyModal, setShowAgencyModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [showPackageModal, setShowPackageModal] = useState(false);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [ratingFilter, setRatingFilter] = useState(0);
  const [locationFilter, setLocationFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Service categories (same as your packages)
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

  useEffect(() => {
    fetchAgenciesWithPackages();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [agencies, searchTerm, categoryFilter, priceRange, ratingFilter, locationFilter]);

  const fetchAgenciesWithPackages = async () => {
    try {
      setLoading(true);
      const authToken = localStorage.getItem('authToken');
      
      // Fetch all agencies with their packages
      const response = await fetch('/api/marketing-agencies', {
        headers: {
          "Content-Type": "application/json",
          ...(authToken && { "Authorization": `Bearer ${authToken}` })
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Fetched agencies with packages:', data);
        setAgencies(data.agencies || []);
      } else {
        // Fallback: fetch agencies and packages separately
        await fetchAgenciesAndPackagesSeparately();
      }
    } catch (error) {
      console.error('Error fetching agencies:', error);
      await fetchAgenciesAndPackagesSeparately();
    } finally {
      setLoading(false);
    }
  };

  const fetchAgenciesAndPackagesSeparately = async () => {
    try {
      const authToken = localStorage.getItem('authToken');
      
      // Fetch all agencies
      const agenciesResponse = await fetch('/api/users?role=agency', {
        headers: {
          "Content-Type": "application/json",
          ...(authToken && { "Authorization": `Bearer ${authToken}` })
        },
      });

      if (agenciesResponse.ok) {
        const agenciesData = await agenciesResponse.json();
        const agenciesWithPackages = [];
        
        // Fetch packages for each agency
        for (const agency of agenciesData.users || []) {
          try {
            const packagesResponse = await fetch(`/api/agency/packages?agencyId=${agency._id}`, {
              headers: {
                "Content-Type": "application/json",
                ...(authToken && { "Authorization": `Bearer ${authToken}` })
              },
            });
            
            if (packagesResponse.ok) {
              const packagesData = await packagesResponse.json();
              const activePackages = (packagesData.packages || []).filter(pkg => 
                pkg.status === 'active' || pkg.status === 'featured'
              );
              
              if (activePackages.length > 0) {
                agenciesWithPackages.push({
                  ...agency,
                  packages: activePackages,
                  services: [...new Set(activePackages.map(pkg => pkg.category))], // Extract services from package categories
                  rating: agency.rating || 4.5, // Default rating
                  reviews: agency.reviews || Math.floor(Math.random() * 100) + 20 // Default reviews
                });
              }
            }
          } catch (error) {
            console.error(`Error fetching packages for agency ${agency._id}:`, error);
          }
        }
        
        setAgencies(agenciesWithPackages);
      }
    } catch (error) {
      console.error('Error in fallback fetch:', error);
      toast.error('Failed to load marketing agencies');
    }
  };

  const handleRequestProposal = async (agency, pkg) => {
    try {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        toast.error('Please log in to request a proposal');
        return;
      }

      const additionalRequirements = document.querySelector('textarea')?.value || '';

      const response = await fetch('/api/marketing-proposals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          agencyId: agency._id,
          packageId: pkg._id,
          packageName: pkg.name,
          additionalRequirements,
          budget: pkg.price,
          timeline: pkg.duration,
          category: pkg.category
        })
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(`Proposal request sent to ${agency.companyName || agency.name} for ${pkg.name}`);
        setShowPackageModal(false);
      } else {
        throw new Error(result.error || 'Failed to submit proposal');
      }
    } catch (error) {
      console.error('Error submitting proposal:', error);
      toast.error(error.message || 'Failed to submit proposal request');
    }
  };

  const handleContactAgency = async (agency) => {
    try {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        toast.error('Please log in to contact agencies');
        return;
      }
      
      const response = await fetch('/api/marketing-agencies/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          agencyId: agency._id,
          agencyName: agency.companyName || agency.name,
          message: 'I am interested in your marketing services and would like to learn more about your packages.',
          inquiryType: 'general'
        })
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(`Contact request sent to ${agency.companyName || agency.name}`);
        setShowAgencyModal(false);
      } else {
        throw new Error(result.error || 'Failed to send contact request');
      }
    } catch (error) {
      console.error('Error contacting agency:', error);
      toast.error(error.message || 'Failed to contact agency');
    }
  };

  const applyFilters = () => {
    let filtered = [...agencies];

    // Apply search filter
    if (searchTerm) {
      const searchTermLower = searchTerm.toLowerCase();
      filtered = filtered.filter(agency => {
        const name = agency.companyName || agency.name || '';
        const description = agency.description || '';
        const services = agency.services ? agency.services.join(' ').toLowerCase() : '';
        
        return (
          name.toLowerCase().includes(searchTermLower) ||
          description.toLowerCase().includes(searchTermLower) ||
          services.includes(searchTermLower)
        );
      });
    }

    // Apply category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(agency => 
        agency.services && agency.services.includes(categoryFilter)
      );
    }

    // Apply price range filter
    filtered = filtered.filter(agency => {
      if (!agency.packages || agency.packages.length === 0) return false;
      const minPackagePrice = Math.min(...agency.packages.map(p => p.price || 0));
      return minPackagePrice >= priceRange[0] && minPackagePrice <= priceRange[1];
    });

    // Apply rating filter
    if (ratingFilter > 0) {
      filtered = filtered.filter(agency => (agency.rating || 0) >= ratingFilter);
    }

    // Apply location filter
    if (locationFilter) {
      filtered = filtered.filter(agency => {
        const location = agency.location || agency.companyDetails?.location || '';
        return location.toLowerCase().includes(locationFilter.toLowerCase());
      });
    }

    setFilteredAgencies(filtered);
  };

  const renderStars = (rating) => {
    const actualRating = rating || 4.0;
    const stars = [];
    const fullStars = Math.floor(actualRating);
    const hasHalfStar = actualRating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<StarIconSolid key={i} className="h-5 w-5 text-yellow-400" />);
    }

    if (hasHalfStar) {
      stars.push(<StarIconSolid key="half" className="h-5 w-5 text-yellow-400" />);
    }

    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<StarIcon key={`empty-${i}`} className="h-5 w-5 text-gray-300" />);
    }

    return stars;
  };

  const getServiceIcon = (serviceType) => {
    switch (serviceType) {
      case 'Social Media Marketing':
        return <ShareIcon className="h-4 w-4 text-purple-600" />;
      case 'SEO & Content Marketing':
        return <ChartBarIcon className="h-4 w-4 text-green-600" />;
      case 'PPC Advertising':
        return <CurrencyDollarIcon className="h-4 w-4 text-blue-600" />;
      case 'Email Marketing':
        return <EnvelopeIcon className="h-4 w-4 text-red-600" />;
      case 'Video Marketing':
        return <TvIcon className="h-4 w-4 text-orange-600" />;
      case 'Web Design & Development':
        return <PaintBrushIcon className="h-4 w-4 text-indigo-600" />;
      default:
        return <MegaphoneIcon className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status) => {
    const actualStatus = status || 'active';
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

  const clearFilters = () => {
    setSearchTerm('');
    setCategoryFilter('all');
    setPriceRange([0, 10000]);
    setRatingFilter(0);
    setLocationFilter('');
  };

  const formatPrice = (price) => {
    return price?.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }) || '0';
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
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Digital Marketing Agencies
        </h1>
        <p className="text-gray-600">
          Discover professional marketing agencies and their service packages. Find the perfect partner for your marketing needs.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg p-6 border shadow-sm">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search agencies by name, description, or services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            <FunnelIcon className="h-5 w-5" />
            Filters
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg border">
            {/* Service Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Service Category
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

            {/* Location Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                type="text"
                placeholder="Filter by location"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Rating Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Rating
              </label>
              <select
                value={ratingFilter}
                onChange={(e) => setRatingFilter(Number(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500"
              >
                <option value={0}>Any Rating</option>
                <option value={4.5}>4.5+ Stars</option>
                <option value={4.0}>4.0+ Stars</option>
                <option value={3.5}>3.5+ Stars</option>
                <option value={3.0}>3.0+ Stars</option>
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

        {/* Price Range Filter */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Price Range: ${priceRange[0].toLocaleString()} - ${priceRange[1].toLocaleString()}
          </label>
          <div className="flex items-center space-x-4">
            <input
              type="range"
              min="0"
              max="10000"
              step="1000"
              value={priceRange[0]}
              onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <input
              type="range"
              min="0"
              max="10000"
              step="1000"
              value={priceRange[1]}
              onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>

        {/* Results Count and Clear Filters */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">
            Found {filteredAgencies.length} of {agencies.length} agencies
          </span>
          {(searchTerm || categoryFilter !== 'all' || priceRange[0] > 0 || priceRange[1] < 10000 || ratingFilter > 0 || locationFilter) && (
            <button
              onClick={clearFilters}
              className="text-sm text-purple-600 hover:text-purple-800"
            >
              Clear All Filters
            </button>
          )}
        </div>
      </div>

      {/* Agencies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAgencies.map((agency) => (
          <div key={agency._id || agency.id} className="bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow">
            {/* Agency Header */}
            <div className="p-4 border-b">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <BuildingStorefrontIcon className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{agency.companyName || agency.name}</h3>
                    <div className="flex items-center space-x-1">
                      {renderStars(agency.rating)}
                      <span className="text-sm text-gray-600">({agency.reviews} reviews)</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <p className="text-gray-600 text-sm line-clamp-2">
                {agency.description || agency.companyDetails?.description || 'Professional marketing agency offering comprehensive digital marketing services.'}
              </p>
            </div>

            {/* Agency Details */}
            <div className="p-4 space-y-3">
              <div className="flex items-center text-sm text-gray-600">
                <MapPinIcon className="h-4 w-4 mr-2" />
                {agency.location || agency.companyDetails?.location || 'Location not specified'}
              </div>

              {/* Services */}
              <div>
                <span className="text-sm font-medium text-gray-700">Services:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {agency.services?.slice(0, 3).map((service, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full"
                    >
                      {getServiceIcon(service)}
                      <span className="ml-1">{service}</span>
                    </span>
                  ))}
                  {agency.services && agency.services.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                      +{agency.services.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              {/* Packages Preview */}
              <div>
                <span className="text-sm font-medium text-gray-700">Available Packages:</span>
                <div className="mt-1 space-y-2">
                  {agency.packages?.slice(0, 2).map((pkg) => (
                    <div key={pkg._id || pkg.id} className="flex justify-between items-center text-sm p-2 bg-gray-50 rounded">
                      <div>
                        <span className="font-medium text-gray-800">{pkg.name}</span>
                        <div className="flex items-center gap-1 mt-1">
                          <TagIcon className="h-3 w-3 text-gray-500" />
                          <span className="text-xs text-gray-600">{pkg.category}</span>
                        </div>
                      </div>
                      <span className="font-semibold text-purple-600">${formatPrice(pkg.price)}</span>
                    </div>
                  ))}
                  {agency.packages && agency.packages.length > 2 && (
                    <div className="text-center">
                      <span className="text-xs text-gray-500">
                        +{agency.packages.length - 2} more packages
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="p-4 border-t bg-gray-50">
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setSelectedAgency(agency);
                    setShowAgencyModal(true);
                  }}
                  className="flex-1 bg-purple-600 text-white py-2 px-3 rounded-md hover:bg-purple-700 text-sm"
                >
                  View Details
                </button>
                <button
                  onClick={() => handleContactAgency(agency)}
                  className="flex-1 border border-gray-300 text-gray-700 py-2 px-3 rounded-md hover:bg-gray-50 text-sm"
                >
                  Contact
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* No Results Message */}
      {filteredAgencies.length === 0 && !loading && (
        <div className="text-center py-12 bg-white rounded-lg border">
          <MegaphoneIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No agencies found</h3>
          <p className="text-gray-500 mb-4">
            {agencies.length === 0 
              ? "No marketing agencies are currently available." 
              : "Try adjusting your search criteria or clear filters to see more results."}
          </p>
          {agencies.length === 0 ? (
            <p className="text-sm text-gray-500">
              Check back later or contact platform support for more information.
            </p>
          ) : (
            <button
              onClick={clearFilters}
              className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700"
            >
              Clear All Filters
            </button>
          )}
        </div>
      )}

      {/* Agency Details Modal */}
      {showAgencyModal && selectedAgency && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center">
                  <BuildingStorefrontIcon className="h-8 w-8 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{selectedAgency.companyName || selectedAgency.name}</h2>
                  <div className="flex items-center space-x-2 mt-1">
                    {renderStars(selectedAgency.rating)}
                    <span className="text-gray-600">({selectedAgency.reviews} reviews)</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowAgencyModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Agency Information */}
              <div className="lg:col-span-2 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">About</h3>
                  <p className="text-gray-700">
                    {selectedAgency.description || selectedAgency.companyDetails?.description || 'Professional marketing agency offering comprehensive digital marketing services.'}
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Services Offered</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedAgency.services?.map((service, index) => (
                      <div key={index} className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                        {getServiceIcon(service)}
                        <span className="font-medium">{service}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Service Packages</h3>
                  <div className="space-y-4">
                    {selectedAgency.packages?.map((pkg) => (
                      <div key={pkg._id || pkg.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-semibold">{pkg.name}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">
                                {pkg.category}
                              </span>
                              {pkg.status && (
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  pkg.status === 'featured' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {pkg.status}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-xl font-bold text-purple-600">${formatPrice(pkg.price)}</span>
                            <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                              <ClockIcon className="h-4 w-4" />
                              <span>{pkg.duration} days</span>
                            </div>
                          </div>
                        </div>
                        <p className="text-gray-700 text-sm mb-3">{pkg.description}</p>
                        
                        {pkg.features && pkg.features.length > 0 && (
                          <div className="space-y-1 mb-3">
                            {pkg.features.slice(0, 4).map((feature, index) => (
                              <div key={index} className="flex items-center text-sm">
                                <CheckIcon className="h-4 w-4 text-green-500 mr-2" />
                                <span className="line-clamp-1">{feature}</span>
                              </div>
                            ))}
                            {pkg.features.length > 4 && (
                              <div className="text-sm text-gray-500 text-center">
                                +{pkg.features.length - 4} more features
                              </div>
                            )}
                          </div>
                        )}

                        {pkg.successRate && (
                          <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                            <ChartBarIcon className="h-4 w-4" />
                            <span>{pkg.successRate}% success rate</span>
                          </div>
                        )}

                        <button
                          onClick={() => {
                            setSelectedPackage(pkg);
                            setShowPackageModal(true);
                          }}
                          className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700"
                        >
                          Request Proposal
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-3">Contact Information</h3>
                  <div className="space-y-3">
                    {selectedAgency.contact?.phone && (
                      <div className="flex items-center text-gray-700">
                        <PhoneIcon className="h-5 w-5 mr-3" />
                        {selectedAgency.contact.phone}
                      </div>
                    )}
                    <div className="flex items-center text-gray-700">
                      <EnvelopeIcon className="h-5 w-5 mr-3" />
                      {selectedAgency.email || selectedAgency.contact?.email}
                    </div>
                    {selectedAgency.contact?.website && (
                      <div className="flex items-center text-gray-700">
                        <GlobeAltIcon className="h-5 w-5 mr-3" />
                        {selectedAgency.contact.website}
                      </div>
                    )}
                    <div className="flex items-center text-gray-700">
                      <MapPinIcon className="h-5 w-5 mr-3" />
                      {selectedAgency.location || selectedAgency.companyDetails?.location || 'Location not specified'}
                    </div>
                  </div>
                  <button
                    onClick={() => handleContactAgency(selectedAgency)}
                    className="w-full mt-4 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
                  >
                    Contact Agency
                  </button>
                </div>

                <div className="bg-yellow-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-2">Why Choose This Agency?</h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-center">
                      <CheckIcon className="h-4 w-4 text-green-500 mr-2" />
                      Professional team with proven experience
                    </li>
                    <li className="flex items-center">
                      <CheckIcon className="h-4 w-4 text-green-500 mr-2" />
                      Comprehensive service packages
                    </li>
                    <li className="flex items-center">
                      <CheckIcon className="h-4 w-4 text-green-500 mr-2" />
                      Transparent pricing
                    </li>
                    <li className="flex items-center">
                      <CheckIcon className="h-4 w-4 text-green-500 mr-2" />
                      Excellent customer reviews
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Package Proposal Modal */}
      {showPackageModal && selectedPackage && selectedAgency && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Request Proposal</h2>
            
            <div className="space-y-4 mb-6">
              <div>
                <strong>Agency:</strong> {selectedAgency.companyName || selectedAgency.name}
              </div>
              <div>
                <strong>Package:</strong> {selectedPackage.name}
              </div>
              <div>
                <strong>Category:</strong> {selectedPackage.category}
              </div>
              <div>
                <strong>Price:</strong> ${formatPrice(selectedPackage.price)}
              </div>
              <div>
                <strong>Duration:</strong> {selectedPackage.duration} days
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Requirements (Optional)
                </label>
                <textarea
                  rows={4}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500"
                  placeholder="Describe any specific requirements or customization needs..."
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowPackageModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRequestProposal(selectedAgency, selectedPackage)}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
              >
                Send Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DigitalMarketingServices;