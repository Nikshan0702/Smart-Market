"use client";

import { useState, useEffect } from 'react';
import { 
  MagnifyingGlassIcon,
  MapPinIcon,
  ArrowsPointingOutIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  BuildingStorefrontIcon,
  ClockIcon,
  CheckIcon,
  XMarkIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';

const CorporateWarehouse = () => {
  const [warehouses, setWarehouses] = useState([]);
  const [filteredWarehouses, setFilteredWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingDetails, setBookingDetails] = useState(null);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [minArea, setMinArea] = useState('');
  const [maxArea, setMaxArea] = useState('');
  const [maxDailyRate, setMaxDailyRate] = useState('');
  const [amenitiesFilter, setAmenitiesFilter] = useState([]);

  // Booking form states
  const [bookingForm, setBookingForm] = useState({
    startDate: '',
    endDate: '',
    requiredArea: '',
    specialRequirements: ''
  });

  // Available amenities for filtering
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
    fetchAvailableWarehouses();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [warehouses, searchTerm, cityFilter, minArea, maxArea, maxDailyRate, amenitiesFilter]);

  const fetchAvailableWarehouses = async () => {
    try {
      setLoading(true);
      const authToken = localStorage.getItem('authToken');
      
      const headers = {
        "Content-Type": "application/json",
      };
      
      if (authToken) {
        headers["Authorization"] = `Bearer ${authToken}`;
      }
      
      const response = await fetch('/api/warehouses/available', {
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
      toast.error('Failed to load available warehouses');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = warehouses.filter(warehouse => 
      warehouse.status === 'active' && warehouse.availableArea > 0
    );

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

    // Apply city filter
    if (cityFilter) {
      filtered = filtered.filter(warehouse => 
        warehouse.city.toLowerCase().includes(cityFilter.toLowerCase())
      );
    }

    // Apply area filters
    if (minArea) {
      filtered = filtered.filter(warehouse => 
        warehouse.availableArea >= parseInt(minArea)
      );
    }

    if (maxArea) {
      filtered = filtered.filter(warehouse => 
        warehouse.availableArea <= parseInt(maxArea)
      );
    }

    // Apply daily rate filter
    if (maxDailyRate) {
      filtered = filtered.filter(warehouse => 
        warehouse.dailyRate <= parseFloat(maxDailyRate)
      );
    }

    // Apply amenities filter
    if (amenitiesFilter.length > 0) {
      filtered = filtered.filter(warehouse =>
        amenitiesFilter.every(amenity => 
          warehouse.amenities && warehouse.amenities.includes(amenity)
        )
      );
    }

    setFilteredWarehouses(filtered);
  };

  const calculateTotalPrice = (warehouse, area, startDate, endDate) => {
    if (!warehouse || !area || !startDate || !endDate) return 0;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    
    return warehouse.dailyRate * area * days;
  };

  const checkAvailability = async (warehouseId, startDate, endDate, requiredArea) => {
    try {
      const authToken = localStorage.getItem('authToken');
      
      const response = await fetch('/api/warehouses/check-availability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          warehouseId,
          startDate,
          endDate,
          requiredArea
        })
      });

      if (response.ok) {
        const data = await response.json();
        return data.available;
      }
      return false;
    } catch (error) {
      console.error('Error checking availability:', error);
      return false;
    }
  };

  const handleBookWarehouse = async (warehouse) => {
    if (!bookingForm.startDate || !bookingForm.endDate || !bookingForm.requiredArea) {
      toast.error('Please fill all required fields');
      return;
    }

    const requiredArea = parseInt(bookingForm.requiredArea);
    if (requiredArea > warehouse.availableArea) {
      toast.error('Required area exceeds available space');
      return;
    }

    const isAvailable = await checkAvailability(
      warehouse._id,
      bookingForm.startDate,
      bookingForm.endDate,
      requiredArea
    );

    if (!isAvailable) {
      toast.error('Selected dates are not available for the required area');
      return;
    }

    try {
      const authToken = localStorage.getItem('authToken');
      const totalPrice = calculateTotalPrice(
        warehouse,
        requiredArea,
        bookingForm.startDate,
        bookingForm.endDate
      );

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          warehouse: warehouse._id,
          startDate: bookingForm.startDate,
          endDate: bookingForm.endDate,
          requiredArea: requiredArea,
          totalPrice: totalPrice,
          specialRequirements: bookingForm.specialRequirements
        })
      });

      if (response.ok) {
        const booking = await response.json();
        setBookingDetails(booking);
        setShowBookingModal(false);
        toast.success('Booking request sent successfully! Waiting for dealer confirmation.');
        resetBookingForm();
      } else {
        throw new Error('Failed to create booking');
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      toast.error('Failed to create booking request');
    }
  };

  const resetBookingForm = () => {
    setBookingForm({
      startDate: '',
      endDate: '',
      requiredArea: '',
      specialRequirements: ''
    });
    setSelectedWarehouse(null);
  };

  const handleAmenityToggle = (amenity) => {
    setAmenitiesFilter(prev =>
      prev.includes(amenity)
        ? prev.filter(a => a !== amenity)
        : [...prev, amenity]
    );
  };

  const clearFilters = () => {
    setSearchTerm('');
    setCityFilter('');
    setMinArea('');
    setMaxArea('');
    setMaxDailyRate('');
    setAmenitiesFilter([]);
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
          Find & Book Storage Space
        </h1>
        <p className="text-gray-600">
          Search for available warehouse spaces and book storage for your business needs
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg p-6 border shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* Search Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search Warehouses
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by name, location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* City Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              City
            </label>
            <input
              type="text"
              placeholder="Filter by city"
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Area Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Area Range (sqft)
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Min"
                value={minArea}
                onChange={(e) => setMinArea(e.target.value)}
                className="w-1/2 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                placeholder="Max"
                value={maxArea}
                onChange={(e) => setMaxArea(e.target.value)}
                className="w-1/2 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Max Daily Rate */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Daily Rate ($)
            </label>
            <input
              type="number"
              placeholder="Maximum daily rate"
              value={maxDailyRate}
              onChange={(e) => setMaxDailyRate(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Amenities Filter */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Amenities
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
            {amenitiesList.map(amenity => (
              <label key={amenity} className="flex items-center">
                <input
                  type="checkbox"
                  checked={amenitiesFilter.includes(amenity)}
                  onChange={() => handleAmenityToggle(amenity)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">{amenity}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Results Count and Clear Filters */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">
            Found {filteredWarehouses.length} available warehouses
          </span>
          <button
            onClick={clearFilters}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Clear All Filters
          </button>
        </div>
      </div>

      {/* Warehouses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredWarehouses.map((warehouse) => {
          const minDate = new Date().toISOString().split('T')[0];
          
          return (
            <div key={warehouse._id} className="bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow">
              {/* Warehouse Image */}
              <div className="h-48 bg-gray-200 rounded-t-lg overflow-hidden">
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

              {/* Warehouse Info */}
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2">{warehouse.name}</h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{warehouse.description}</p>

                <div className="space-y-2 text-sm mb-4">
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPinIcon className="h-4 w-4" />
                    <span>{warehouse.address}, {warehouse.city}</span>
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

                {/* Quick Booking Form */}
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        From Date
                      </label>
                      <input
                        type="date"
                        min={minDate}
                        value={bookingForm.startDate}
                        onChange={(e) => setBookingForm(prev => ({
                          ...prev,
                          startDate: e.target.value
                        }))}
                        className="w-full p-1 text-xs border border-gray-300 rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        To Date
                      </label>
                      <input
                        type="date"
                        min={bookingForm.startDate || minDate}
                        value={bookingForm.endDate}
                        onChange={(e) => setBookingForm(prev => ({
                          ...prev,
                          endDate: e.target.value
                        }))}
                        className="w-full p-1 text-xs border border-gray-300 rounded"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Area Needed (sqft)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max={warehouse.availableArea}
                      placeholder={`Max: ${warehouse.availableArea} sqft`}
                      value={bookingForm.requiredArea}
                      onChange={(e) => setBookingForm(prev => ({
                        ...prev,
                        requiredArea: e.target.value
                      }))}
                      className="w-full p-1 text-xs border border-gray-300 rounded"
                    />
                  </div>

                  {/* Price Calculation */}
                  {bookingForm.startDate && bookingForm.endDate && bookingForm.requiredArea && (
                    <div className="bg-blue-50 p-2 rounded">
                      <div className="text-xs font-medium text-blue-800">
                        Estimated Total: ${calculateTotalPrice(
                          warehouse,
                          parseInt(bookingForm.requiredArea),
                          bookingForm.startDate,
                          bookingForm.endDate
                        ).toLocaleString()}
                      </div>
                      <div className="text-xs text-blue-600">
                        {bookingForm.requiredArea} sqft × {Math.ceil(
                          (new Date(bookingForm.endDate) - new Date(bookingForm.startDate)) / (1000 * 60 * 60 * 24)
                        )} days × ${warehouse.dailyRate}/day
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => {
                      setSelectedWarehouse(warehouse);
                      setShowBookingModal(true);
                    }}
                    disabled={!bookingForm.startDate || !bookingForm.endDate || !bookingForm.requiredArea}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm"
                  >
                    Request Booking
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* No Results Message */}
      {filteredWarehouses.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border">
          <BuildingStorefrontIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No warehouses found</h3>
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

      {/* Booking Confirmation Modal */}
      {showBookingModal && selectedWarehouse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Confirm Booking Request</h2>
            
            <div className="space-y-3 mb-6">
              <div>
                <strong>Warehouse:</strong> {selectedWarehouse.name}
              </div>
              <div>
                <strong>Location:</strong> {selectedWarehouse.city}
              </div>
              <div>
                <strong>Dates:</strong> {bookingForm.startDate} to {bookingForm.endDate}
              </div>
              <div>
                <strong>Area:</strong> {bookingForm.requiredArea} sqft
              </div>
              <div>
                <strong>Total Price:</strong> ${calculateTotalPrice(
                  selectedWarehouse,
                  parseInt(bookingForm.requiredArea),
                  bookingForm.startDate,
                  bookingForm.endDate
                ).toLocaleString()}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Special Requirements (Optional)
                </label>
                <textarea
                  value={bookingForm.specialRequirements}
                  onChange={(e) => setBookingForm(prev => ({
                    ...prev,
                    specialRequirements: e.target.value
                  }))}
                  rows={3}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="Any special requirements or notes for the dealer..."
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowBookingModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleBookWarehouse(selectedWarehouse)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Send Booking Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CorporateWarehouse;