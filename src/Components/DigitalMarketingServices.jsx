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
  FunnelIcon
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
  const [serviceFilter, setServiceFilter] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [ratingFilter, setRatingFilter] = useState(0);
  const [locationFilter, setLocationFilter] = useState('');

  // Service types
  const serviceTypes = [
    'TV Advertising',
    'Social Media Marketing',
    'Creative Services',
    'Digital Strategy',
    'Content Marketing',
    'Influencer Marketing',
    'SEO/SEM',
    'Email Marketing'
  ];

  // Sample data structure (replace with actual API data)
  const sampleAgencies = [
    {
      id: 1,
      name: 'Prime Media Solutions',
      logo: '/api/placeholder/100/100',
      description: 'Full-service digital marketing agency specializing in TV and social media campaigns',
      rating: 4.8,
      reviews: 124,
      location: 'New York, NY',
      contact: {
        phone: '+1 (555) 123-4567',
        email: 'contact@primemedia.com',
        website: 'www.primemedia.com'
      },
      services: ['TV Advertising', 'Social Media Marketing', 'Creative Services'],
      packages: [
        {
          id: 1,
          name: 'Starter TV Package',
          type: 'TV Advertising',
          price: 5000,
          duration: '1 month',
          features: [
            '30-second TV spot production',
            'Prime time slot (1x per week)',
            'Basic analytics report',
            '1 creative concept'
          ],
          description: 'Perfect for small businesses looking to test TV advertising'
        },
        {
          id: 2,
          name: 'Social Media Pro',
          type: 'Social Media Marketing',
          price: 3000,
          duration: '3 months',
          features: [
            'Complete social media strategy',
            'Content creation (20 posts/month)',
            'Community management',
            'Performance analytics',
            'Monthly strategy calls'
          ],
          description: 'Comprehensive social media management for growing brands'
        },
        {
          id: 3,
          name: 'Creative Bundle',
          type: 'Creative Services',
          price: 2500,
          duration: '2 weeks',
          features: [
            'Brand identity design',
            '5 social media creatives',
            '1 video advertisement',
            'Copywriting services',
            'Unlimited revisions'
          ],
          description: 'Complete creative package for brand development'
        }
      ]
    },
    {
      id: 2,
      name: 'Digital Wave Agency',
      logo: '/api/placeholder/100/100',
      description: 'Innovative digital marketing experts focused on measurable results',
      rating: 4.6,
      reviews: 89,
      location: 'Los Angeles, CA',
      contact: {
        phone: '+1 (555) 987-6543',
        email: 'hello@digitalwave.com',
        website: 'www.digitalwave.com'
      },
      services: ['Social Media Marketing', 'Creative Services', 'Influencer Marketing'],
      packages: [
        {
          id: 4,
          name: 'Influencer Campaign',
          type: 'Influencer Marketing',
          price: 8000,
          duration: '2 months',
          features: [
            'Influencer identification & vetting',
            '5 influencer collaborations',
            'Content amplification',
            'ROI tracking',
            'Campaign report'
          ],
          description: 'Leverage influencer power for brand awareness'
        },
        {
          id: 5,
          name: 'Creative Studio',
          type: 'Creative Services',
          price: 4500,
          duration: '1 month',
          features: [
            '10 high-quality creatives',
            'Video production (2 videos)',
            'Graphic design assets',
            'Brand guidelines',
            'Dedicated creative team'
          ],
          description: 'Professional creative assets for all platforms'
        }
      ]
    },
    {
      id: 3,
      name: 'Broadcast Masters',
      logo: '/api/placeholder/100/100',
      description: 'TV advertising specialists with 20+ years of industry experience',
      rating: 4.9,
      reviews: 156,
      location: 'Chicago, IL',
      contact: {
        phone: '+1 (555) 456-7890',
        email: 'info@broadcastmasters.com',
        website: 'www.broadcastmasters.com'
      },
      services: ['TV Advertising', 'Digital Strategy'],
      packages: [
        {
          id: 6,
          name: 'Prime Time Package',
          type: 'TV Advertising',
          price: 15000,
          duration: '3 months',
          features: [
            '60-second TV commercial production',
            'Prime time slots (3x per week)',
            'National coverage',
            'A/B testing',
            'Detailed analytics dashboard'
          ],
          description: 'Premium TV advertising for maximum reach'
        },
        {
          id: 7,
          name: 'Digital Combo',
          type: 'Digital Strategy',
          price: 7000,
          duration: '6 months',
          features: [
            'Complete digital audit',
            'Multi-channel strategy',
            'Performance monitoring',
            'Monthly optimization',
            'Dedicated account manager'
          ],
          description: 'Holistic digital strategy for long-term growth'
        }
      ]
    }
  ];

  useEffect(() => {
    fetchAgencies();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [agencies, searchTerm, serviceFilter, priceRange, ratingFilter, locationFilter]);

  // In your DigitalMarketingServices component, update these functions:

const fetchAgencies = async () => {
  try {
    setLoading(true);
    const authToken = localStorage.getItem('authToken');
    
    const response = await fetch('/api/marketing-agencies', {
      headers: {
        "Content-Type": "application/json",
        ...(authToken && { "Authorization": `Bearer ${authToken}` })
      },
    });

    if (response.ok) {
      const data = await response.json();
      setAgencies(data.agencies || []);
    } else {
      // Fallback to sample data if API fails
      setAgencies(sampleAgencies);
    }
  } catch (error) {
    console.error('Error fetching agencies:', error);
    setAgencies(sampleAgencies);
    toast.error('Failed to load marketing agencies');
  } finally {
    setLoading(false);
  }
};

const handleRequestProposal = async (agency, pkg) => {
  try {
    const authToken = localStorage.getItem('authToken');
    const additionalRequirements = document.querySelector('textarea')?.value || '';

    const response = await fetch('/api/marketing-proposals', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        agencyId: agency._id,
        packageId: pkg._id || pkg.id, // Handle both sample and real data
        additionalRequirements,
        budget: pkg.price,
        timeline: pkg.duration
      })
    });

    const result = await response.json();

    if (response.ok) {
      toast.success(`Proposal request sent to ${agency.name} for ${pkg.name}`);
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
    
    const response = await fetch('/api/marketing-agencies/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        agencyId: agency._id,
        message: 'I am interested in your marketing services',
        inquiryType: 'general'
      })
    });

    const result = await response.json();

    if (response.ok) {
      toast.success(`Contact request sent to ${agency.name}`);
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
        const name = agency.name ? agency.name.toLowerCase() : '';
        const description = agency.description ? agency.description.toLowerCase() : '';
        const services = agency.services ? agency.services.join(' ').toLowerCase() : '';
        
        return (
          name.includes(searchTermLower) ||
          description.includes(searchTermLower) ||
          services.includes(searchTermLower)
        );
      });
    }

    // Apply service filter
    if (serviceFilter !== 'all') {
      filtered = filtered.filter(agency => 
        agency.services && agency.services.includes(serviceFilter)
      );
    }

    // Apply price range filter
    filtered = filtered.filter(agency => {
      const minPackagePrice = Math.min(...agency.packages.map(p => p.price));
      return minPackagePrice >= priceRange[0] && minPackagePrice <= priceRange[1];
    });

    // Apply rating filter
    if (ratingFilter > 0) {
      filtered = filtered.filter(agency => agency.rating >= ratingFilter);
    }

    // Apply location filter
    if (locationFilter) {
      filtered = filtered.filter(agency => 
        agency.location.toLowerCase().includes(locationFilter.toLowerCase())
      );
    }

    setFilteredAgencies(filtered);
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

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
      case 'TV Advertising':
        return <TvIcon className="h-5 w-5 text-blue-600" />;
      case 'Social Media Marketing':
        return <ShareIcon className="h-5 w-5 text-purple-600" />;
      case 'Creative Services':
        return <PaintBrushIcon className="h-5 w-5 text-green-600" />;
      default:
        return <BuildingStorefrontIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setServiceFilter('all');
    setPriceRange([0, 10000]);
    setRatingFilter(0);
    setLocationFilter('');
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
          Discover professional marketing agencies offering TV slots, social media management, creative services, and more
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg p-6 border shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* Search Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search Agencies
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by name, services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Service Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Service Type
            </label>
            <select
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Services</option>
              {serviceTypes.map(service => (
                <option key={service} value={service}>{service}</option>
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
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
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
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value={0}>Any Rating</option>
              <option value={4.5}>4.5+ Stars</option>
              <option value={4.0}>4.0+ Stars</option>
              <option value={3.5}>3.5+ Stars</option>
              <option value={3.0}>3.0+ Stars</option>
            </select>
          </div>
        </div>

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
          <button
            onClick={clearFilters}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Clear All Filters
          </button>
        </div>
      </div>

      {/* Agencies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAgencies.map((agency) => (
          <div key={agency.id} className="bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow">
            {/* Agency Header */}
            <div className="p-4 border-b">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                    <BuildingStorefrontIcon className="h-6 w-6 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{agency.name}</h3>
                    <div className="flex items-center space-x-1">
                      {renderStars(agency.rating)}
                      <span className="text-sm text-gray-600">({agency.reviews})</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <p className="text-gray-600 text-sm line-clamp-2">{agency.description}</p>
            </div>

            {/* Agency Details */}
            <div className="p-4 space-y-3">
              <div className="flex items-center text-sm text-gray-600">
                <MapPinIcon className="h-4 w-4 mr-2" />
                {agency.location}
              </div>

              {/* Services */}
              <div>
                <span className="text-sm font-medium text-gray-700">Services:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {agency.services.map((service, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                    >
                      {getServiceIcon(service)}
                      <span className="ml-1">{service}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Packages Preview */}
              <div>
                <span className="text-sm font-medium text-gray-700">Packages from:</span>
                <div className="mt-1 space-y-2">
                  {agency.packages.slice(0, 2).map((pkg) => (
                    <div key={pkg.id} className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">{pkg.name}</span>
                      <span className="font-semibold">${pkg.price.toLocaleString()}</span>
                    </div>
                  ))}
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
                  className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-md hover:bg-blue-700 text-sm"
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
      {filteredAgencies.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border">
          <BuildingStorefrontIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No agencies found</h3>
          <p className="text-gray-500 mb-4">
            Try adjusting your search criteria or clear filters to see more results.
          </p>
          <button
            onClick={clearFilters}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Clear All Filters
          </button>
        </div>
      )}

      {/* Agency Details Modal */}
      {showAgencyModal && selectedAgency && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                  <BuildingStorefrontIcon className="h-8 w-8 text-gray-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{selectedAgency.name}</h2>
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
                  <p className="text-gray-700">{selectedAgency.description}</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Services Offered</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedAgency.services.map((service, index) => (
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
                    {selectedAgency.packages.map((pkg) => (
                      <div key={pkg.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-semibold">{pkg.name}</h4>
                            <span className="text-sm text-gray-600">{pkg.type} • {pkg.duration}</span>
                          </div>
                          <span className="text-xl font-bold text-blue-600">${pkg.price.toLocaleString()}</span>
                        </div>
                        <p className="text-gray-700 text-sm mb-3">{pkg.description}</p>
                        <div className="space-y-1 mb-3">
                          {pkg.features.map((feature, index) => (
                            <div key={index} className="flex items-center text-sm">
                              <CheckIcon className="h-4 w-4 text-green-500 mr-2" />
                              {feature}
                            </div>
                          ))}
                        </div>
                        <button
                          onClick={() => {
                            setSelectedPackage(pkg);
                            setShowPackageModal(true);
                          }}
                          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
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
                    <div className="flex items-center text-gray-700">
                      <PhoneIcon className="h-5 w-5 mr-3" />
                      {selectedAgency.contact.phone}
                    </div>
                    <div className="flex items-center text-gray-700">
                      <EnvelopeIcon className="h-5 w-5 mr-3" />
                      {selectedAgency.contact.email}
                    </div>
                    <div className="flex items-center text-gray-700">
                      <GlobeAltIcon className="h-5 w-5 mr-3" />
                      {selectedAgency.contact.website}
                    </div>
                    <div className="flex items-center text-gray-700">
                      <MapPinIcon className="h-5 w-5 mr-3" />
                      {selectedAgency.location}
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
                <strong>Agency:</strong> {selectedAgency.name}
              </div>
              <div>
                <strong>Package:</strong> {selectedPackage.name}
              </div>
              <div>
                <strong>Price:</strong> ${selectedPackage.price.toLocaleString()}
              </div>
              <div>
                <strong>Duration:</strong> {selectedPackage.duration}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Requirements (Optional)
                </label>
                <textarea
                  rows={4}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
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
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
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