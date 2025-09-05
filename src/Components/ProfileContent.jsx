"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  UserIcon, 
  EnvelopeIcon, 
  PhoneIcon, 
  BuildingOfficeIcon,
  BriefcaseIcon,
  PencilSquareIcon 
} from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';

const ProfileContent = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    role: '',
    companyName: ''
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/SignInPage');
      return;
    }

    if (status === 'authenticated' && session) {
      fetchUserProfile();
    }
  }, [status, session, router]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/user/Profile");
      
      if (!response.ok) {
        if (response.status === 401) {
          // Handle unauthorized access
          router.push('/SignInPage');
          return;
        }
        throw new Error("Failed to fetch user profile");
      }
  
      const userProfile = await response.json();
      setUserData(userProfile);
      
      // Initialize form data with user profile
      setFormData({
        firstName: userProfile.firstName || '',
        lastName: userProfile.lastName || '',
        email: userProfile.email || '',
        mobile: userProfile.mobile || '',
        role: userProfile.role || '',
        companyName: userProfile.companyDetails?.name || ''
      });
    } catch (err) {
      console.error("Error fetching profile:", err);
      toast.error("Failed to load profile");
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

  const handleSave = async () => {
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.accessToken || ''}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const updatedProfile = await response.json();
      setUserData(updatedProfile);
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="bg-white rounded-lg p-6 border shadow-sm mb-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="bg-gray-50 p-8 rounded-md text-center">
            <div className="h-12 w-12 bg-gray-200 rounded-full mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="bg-white rounded-lg p-6 border shadow-sm mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">My Profile</h2>
        <div className="bg-gray-50 p-8 rounded-md text-center">
          <UserIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 italic">Failed to load profile data</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-white rounded-lg p-6 border shadow-sm mb-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">My Profile</h2>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <PencilSquareIcon className="h-5 w-5" />
              Edit Profile
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                Save Changes
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Information */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center gap-2">
              <UserIcon className="h-5 w-5" />
              Personal Information
            </h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900">{userData.firstName}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900">{userData.lastName}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                  <EnvelopeIcon className="h-4 w-4" />
                  Email
                </label>
                <p className="text-gray-900">{userData.email}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                  <PhoneIcon className="h-4 w-4" />
                  Mobile Number
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900">{userData.mobile || 'Not provided'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                  <BriefcaseIcon className="h-4 w-4" />
                  Role
                </label>
                <p className="text-gray-900 capitalize">{userData.role}</p>
              </div>
            </div>
          </div>

          {/* Company Information */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center gap-2">
              <BuildingOfficeIcon className="h-5 w-5" />
              Company Information
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900">{userData.companyDetails?.name || 'Not provided'}</p>
                )}
              </div>

              {userData.companyDetails && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Registration Number
                    </label>
                    <p className="text-gray-900">{userData.companyDetails.registrationNumber || 'Not provided'}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tax ID
                    </label>
                    <p className="text-gray-900">{userData.companyDetails.taxId || 'Not provided'}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Industry Type
                    </label>
                    <p className="text-gray-900 capitalize">{userData.companyDetails.industryType || 'Not provided'}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <p className="text-gray-900">
                      {userData.companyDetails.address ? 
                        `${userData.companyDetails.address.street}, ${userData.companyDetails.address.city}, ${userData.companyDetails.address.country}` 
                        : 'Not provided'
                      }
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Account Status */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="text-md font-medium text-blue-800 mb-2">Account Status</h4>
          <div className="flex items-center gap-2">
            <div className={`h-3 w-3 rounded-full ${
              userData.status === 'active' ? 'bg-green-500' : 
              userData.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
            }`}></div>
            <span className="text-sm font-medium capitalize">
              {userData.status === 'active' ? 'Active' :
               userData.status === 'pending' ? 'Pending Verification' :
               'Suspended'}
            </span>
          </div>
          {userData.status === 'pending' && (
            <p className="text-sm text-blue-600 mt-2">
              Your account is pending verification. Please check your email for verification instructions.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileContent;