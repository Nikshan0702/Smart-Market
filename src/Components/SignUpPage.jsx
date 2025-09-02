// "use client";

// import React, { useState } from 'react';
// import { CloudUpload, Close, Visibility, VisibilityOff, Business } from '@mui/icons-material';
// import { useRouter } from 'next/navigation';
// import { toast } from 'react-toastify';

// const SignUpPage = () => {
//   const router = useRouter();
//   const [formData, setFormData] = useState({
//     firstName: '',
//     lastName: '',
//     email: '',
//     mobile: '',
//     password: '',
//     role: 'Corporate', // Default role
//   });
//   const [companyData, setCompanyData] = useState({
//     name: '',
//     registrationNumber: '',
//     taxId: '',
//     industryType: '',
//     address: {
//       street: '',
//       city: '',
//       country: ''
//     },
//     website: ''
//   });
//   const [showPassword, setShowPassword] = useState(false);
//   const [errors, setErrors] = useState({});
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [agreeTerms, setAgreeTerms] = useState(false);

//   const industryTypes = [
//     'Retail', 'Manufacturing', 'Technology', 'Healthcare', 'Finance',
//     'Education', 'Construction', 'Transportation', 'Hospitality', 'Other'
//   ];

//   const countries = [
//     'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany',
//     'France', 'India', 'Japan', 'Brazil', 'Other'
//   ];

//   const handleChange = (e) => {
//     const { name, value } = e.target;
    
//     if (name.startsWith('company.')) {
//       // Handle nested company data
//       const companyField = name.split('.')[1];
//       if (companyField === 'street' || companyField === 'city' || companyField === 'country') {
//         setCompanyData(prev => ({
//           ...prev,
//           address: {
//             ...prev.address,
//             [companyField]: value
//           }
//         }));
//       } else {
//         setCompanyData(prev => ({
//           ...prev,
//           [companyField]: value
//         }));
//       }
//     } else {
//       // Handle user data
//       setFormData(prev => ({
//         ...prev,
//         [name]: value
//       }));
//     }
    
//     // Clear error when field is updated
//     if (errors[name]) {
//       setErrors(prev => ({
//         ...prev,
//         [name]: ''
//       }));
//     }
//   };

//   const validateForm = () => {
//     const newErrors = {};
    
//     // User validation
//     if (!formData.firstName) newErrors.firstName = 'First name is required';
//     if (!formData.lastName) newErrors.lastName = 'Last name is required';
//     if (!formData.email) newErrors.email = 'Email is required';
//     if (!formData.mobile) newErrors.mobile = 'Mobile number is required';
//     if (!formData.password) newErrors.password = 'Password is required';
//     if (formData.password && formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
//     if (!formData.role) newErrors.role = 'Role is required';
    
//     // Email format validation
//     const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
//     if (formData.email && !emailRegex.test(formData.email)) {
//       newErrors.email = 'Please enter a valid email';
//     }
    
//     // Company validation (if role requires company)
//     if (formData.role && formData.role !== 'Admin') {
//       if (!companyData.name) newErrors.companyName = 'Company name is required';
//       if (!companyData.registrationNumber) newErrors.registrationNumber = 'Registration number is required';
//       if (!companyData.taxId) newErrors.taxId = 'Tax ID is required';
//       if (!companyData.industryType) newErrors.industryType = 'Industry type is required';
//       if (!companyData.address.street) newErrors.street = 'Street address is required';
//       if (!companyData.address.city) newErrors.city = 'City is required';
//       if (!companyData.address.country) newErrors.country = 'Country is required';
//     }
    
//     if (!agreeTerms) newErrors.agreeTerms = 'You must agree to the terms and conditions';
    
//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     if (!validateForm()) {
//       toast.error('Please fix the errors in the form');
//       return;
//     }
    
//     setIsSubmitting(true);
    
//     try {
//       // Prepare company details if needed
//       let companyDetails = null;
//       if (formData.role !== 'Admin') {
//         companyDetails = {
//           name: companyData.name,
//           registrationNumber: companyData.registrationNumber,
//           taxId: companyData.taxId,
//           industryType: companyData.industryType,
//           address: {
//             street: companyData.address.street,
//             city: companyData.address.city,
//             country: companyData.address.country
//           },
//           website: companyData.website
//         };
//       }
  
//       // Create user with embedded company details
//       const userResponse = await fetch('/api/user', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           firstName: formData.firstName.trim(),
//           lastName: formData.lastName.trim(),
//           email: formData.email.trim().toLowerCase(),
//           mobile: formData.mobile.trim(),
//           password: formData.password,
//           role: formData.role,
//           companyDetails: companyDetails
//         }),
//       });
      
//       const userResult = await userResponse.json();
      
//       if (!userResponse.ok) {
//         throw new Error(userResult.error || 'Failed to create user account');
//       }
      
//       toast.success('Account created successfully! Please check your email for verification.');
//       router.push('/SignInPage');
      
//     } catch (error) {
//       console.error('Signup error:', error);
//       toast.error(error.message || 'Registration failed. Please try again.');
//     } finally {
//       setIsSubmitting(false);
//     }
//   };
//   const handleClickShowPassword = () => {
//     setShowPassword(!showPassword);
//   };

//   const showCompanyForm = formData.role && formData.role !== 'Admin';

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center py-8 px-4">
//       <div className={`max-w-5xl w-full transition-all duration-500 ${showCompanyForm ? 'flex gap-6' : ''}`}>
//         {/* Left Column - Always visible */}
//         <div className={`bg-white p-6 rounded-lg shadow-md ${showCompanyForm ? 'w-1/2' : 'w-full mx-auto'}`}>
//           <div className="flex flex-col items-center">
//             <h1 className="text-xl font-bold mb-4 text-gray-800">Create Account</h1>
            
//             <form onSubmit={handleSubmit} className="w-full">
//               <h2 className="text-sm font-bold mb-3 text-gray-700 border-b pb-2">Personal Information</h2>
              
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
//                 <div className="w-full">
//                   <label className="block text-xs font-bold text-gray-700 mb-1">First Name *</label>
//                   <input
//                     name="firstName"
//                     placeholder="John"
//                     value={formData.firstName}
//                     onChange={handleChange}
//                     className={`w-full p-2.5 text-sm border rounded-md ${errors.firstName ? 'border-red-500' : 'border-gray-300'}`}
//                   />
//                   {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
//                 </div>
                
//                 <div className="w-full">
//                   <label className="block text-xs font-bold text-gray-700 mb-1">Last Name *</label>
//                   <input
//                     name="lastName"
//                     placeholder="Doe"
//                     value={formData.lastName}
//                     onChange={handleChange}
//                     className={`w-full p-2.5 text-sm border rounded-md ${errors.lastName ? 'border-red-500' : 'border-gray-300'}`}
//                   />
//                   {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
//                 </div>
                
//                 <div className="w-full">
//                   <label className="block text-xs font-bold text-gray-700 mb-1">Email Address *</label>
//                   <input
//                     name="email"
//                     type="email"
//                     placeholder="john.doe@email.com"
//                     value={formData.email}
//                     onChange={handleChange}
//                     className={`w-full p-2.5 text-sm border rounded-md ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
//                   />
//                   {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
//                 </div>
                
//                 <div className="w-full">
//                   <label className="block text-xs font-bold text-gray-700 mb-1">Mobile Number *</label>
//                   <input
//                     name="mobile"
//                     placeholder="+94 77 123 4567"
//                     value={formData.mobile}
//                     onChange={handleChange}
//                     className={`w-full p-2.5 text-sm border rounded-md ${errors.mobile ? 'border-red-500' : 'border-gray-300'}`}
//                   />
//                   {errors.mobile && <p className="text-red-500 text-xs mt-1">{errors.mobile}</p>}
//                 </div>
                
//                 <div className="w-full">
//                   <label className="block text-xs font-bold text-gray-700 mb-1">Password *</label>
//                   <div className="relative">
//                     <input
//                       name="password"
//                       type={showPassword ? 'text' : 'password'}
//                       placeholder="••••••"
//                       value={formData.password}
//                       onChange={handleChange}
//                       className={`w-full p-2.5 pr-8 text-sm border rounded-md ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
//                     />
//                     <button
//                       type="button"
//                       onClick={handleClickShowPassword}
//                       className="absolute inset-y-0 right-0 pr-2 flex items-center text-sm"
//                     >
//                       {showPassword ? <VisibilityOff className="text-gray-500" fontSize="small" /> : <Visibility className="text-gray-500" fontSize="small" />}
//                     </button>
//                   </div>
//                   {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
//                 </div>
//               </div>
              
//               <h2 className="text-sm font-bold mt-5 mb-3 text-gray-700 border-b pb-2">Role Selection</h2>
              
//               <div className="mb-4">
//                 <div className="w-full">
//                   <label className="block text-xs font-bold text-gray-700 mb-1">Select Role *</label>
//                   <select
//                     name="role"
//                     value={formData.role}
//                     onChange={handleChange}
//                     className={`w-full p-2.5 text-sm border rounded-md ${errors.role ? 'border-red-500' : 'border-gray-300'}`}
//                   >
//                     <option value="Corporate">Corporate</option>
//                     <option value="Dealer">Dealer</option>
//                     <option value="Marketing Agency">Marketing Agency</option>
//                     <option value="Admin">Admin (Platform-level)</option>
//                   </select>
//                   {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role}</p>}
//                 </div>
//               </div>
              
//               <div className="flex items-center mb-4 mt-5">
//                 <input
//                   type="checkbox"
//                   id="terms"
//                   checked={agreeTerms}
//                   onChange={(e) => setAgreeTerms(e.target.checked)}
//                   className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
//                 />
//                 <label htmlFor="terms" className="ml-2 block text-xs text-gray-700">
//                   I agree to the Terms and Conditions
//                 </label>
//               </div>
//               {errors.agreeTerms && <p className="text-red-500 text-xs mt-1 mb-2">{errors.agreeTerms}</p>}
              
//               <button
//                 type="submit"
//                 disabled={isSubmitting}
//                 className={`w-full py-3 px-4 rounded-md text-sm font-medium mb-4 ${
//                   isSubmitting 
//                     ? 'bg-blue-400 cursor-not-allowed' 
//                     : 'bg-blue-600 hover:bg-blue-700 text-white'
//                 }`}
//               >
//                 {isSubmitting ? 'Creating Account...' : 'Create Account'}
//               </button>
              
//               <div className="text-center">
//                 <span className="text-xs text-gray-600">
//                   Already have an account?{' '}
//                 </span>
//                 <a href="/SignInPage" className="text-xs font-bold text-blue-600 hover:underline">
//                   Sign in
//                 </a>
//               </div>
//             </form>
//           </div>
//         </div>

//         {/* Right Column - Company Details (Appears when needed) */}
//         {showCompanyForm && (
//           <div className="w-1/2 bg-white p-6 rounded-lg shadow-md transition-all duration-500 animate-fadeIn">
//             <div className="flex items-center mb-4">
//               <Business className="text-blue-600 mr-2" />
//               <h2 className="text-lg font-bold text-gray-800">Company Details</h2>
//             </div>
            
//             <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
//               <div className="grid grid-cols-1 gap-3">
//                 <div className="w-full">
//                   <label className="block text-xs font-bold text-gray-700 mb-1">Company Name *</label>
//                   <input
//                     name="company.name"
//                     value={companyData.name}
//                     onChange={handleChange}
//                     className={`w-full p-2.5 text-sm border rounded-md ${errors.companyName ? 'border-red-500' : 'border-gray-300'}`}
//                   />
//                   {errors.companyName && <p className="text-red-500 text-xs mt-1">{errors.companyName}</p>}
//                 </div>
                
//                 <div className="w-full">
//                   <label className="block text-xs font-bold text-gray-700 mb-1">Registration Number *</label>
//                   <input
//                     name="company.registrationNumber"
//                     value={companyData.registrationNumber}
//                     onChange={handleChange}
//                     className={`w-full p-2.5 text-sm border rounded-md ${errors.registrationNumber ? 'border-red-500' : 'border-gray-300'}`}
//                   />
//                   {errors.registrationNumber && <p className="text-red-500 text-xs mt-1">{errors.registrationNumber}</p>}
//                 </div>
                
//                 <div className="w-full">
//                   <label className="block text-xs font-bold text-gray-700 mb-1">Tax ID / VAT / GST *</label>
//                   <input
//                     name="company.taxId"
//                     value={companyData.taxId}
//                     onChange={handleChange}
//                     className={`w-full p-2.5 text-sm border rounded-md ${errors.taxId ? 'border-red-500' : 'border-gray-300'}`}
//                   />
//                   {errors.taxId && <p className="text-red-500 text-xs mt-1">{errors.taxId}</p>}
//                 </div>
                
//                 <div className="w-full">
//                   <label className="block text-xs font-bold text-gray-700 mb-1">Industry Type *</label>
//                   <select
//                     name="company.industryType"
//                     value={companyData.industryType}
//                     onChange={handleChange}
//                     className={`w-full p-2.5 text-sm border rounded-md ${errors.industryType ? 'border-red-500' : 'border-gray-300'}`}
//                   >
//                     <option value="">Select industry</option>
//                     {industryTypes.map(type => (
//                       <option key={type} value={type}>{type}</option>
//                     ))}
//                   </select>
//                   {errors.industryType && <p className="text-red-500 text-xs mt-1">{errors.industryType}</p>}
//                 </div>
                
//                 <div className="w-full">
//                   <label className="block text-xs font-bold text-gray-700 mb-1">Street Address *</label>
//                   <input
//                     name="company.street"
//                     placeholder="Street address"
//                     value={companyData.address.street}
//                     onChange={handleChange}
//                     className={`w-full p-2.5 text-sm border rounded-md ${errors.street ? 'border-red-500' : 'border-gray-300'}`}
//                   />
//                   {errors.street && <p className="text-red-500 text-xs mt-1">{errors.street}</p>}
//                 </div>
                
//                 <div className="grid grid-cols-2 gap-3">
//                   <div className="w-full">
//                     <label className="block text-xs font-bold text-gray-700 mb-1">City *</label>
//                     <input
//                       name="company.city"
//                       placeholder="City"
//                       value={companyData.address.city}
//                       onChange={handleChange}
//                       className={`w-full p-2.5 text-sm border rounded-md ${errors.city ? 'border-red-500' : 'border-gray-300'}`}
//                     />
//                     {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
//                   </div>
                  
//                   <div className="w-full">
//                     <label className="block text-xs font-bold text-gray-700 mb-1">Country *</label>
//                     <select
//                       name="company.country"
//                       value={companyData.address.country}
//                       onChange={handleChange}
//                       className={`w-full p-2.5 text-sm border rounded-md ${errors.country ? 'border-red-500' : 'border-gray-300'}`}
//                     >
//                       <option value="">Select country</option>
//                       {countries.map(country => (
//                         <option key={country} value={country}>{country}</option>
//                       ))}
//                     </select>
//                     {errors.country && <p className="text-red-500 text-xs mt-1">{errors.country}</p>}
//                   </div>
//                 </div>
                
//                 <div className="w-full">
//                   <label className="block text-xs font-bold text-gray-700 mb-1">Website (Optional)</label>
//                   <input
//                     name="company.website"
//                     placeholder="https://yourcompany.com"
//                     value={companyData.website}
//                     onChange={handleChange}
//                     className="w-full p-2.5 text-sm border border-gray-300 rounded-md"
//                   />
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default SignUpPage;

// "use client";

// import React, { useState } from 'react';
// import { CloudUpload, Close, Visibility, VisibilityOff, Business, Google } from '@mui/icons-material';
// import { useRouter } from 'next/navigation';
// import { toast } from 'react-toastify';
// import { signIn } from 'next-auth/react';

// const SignUpPage = () => {
//   const router = useRouter();
//   const [formData, setFormData] = useState({
//     firstName: '',
//     lastName: '',
//     email: '',
//     mobile: '',
//     password: '',
//     role: 'Corporate',
//   });
//   const [companyData, setCompanyData] = useState({
//     name: '',
//     registrationNumber: '',
//     taxId: '',
//     industryType: '',
//     address: {
//       street: '',
//       city: '',
//       country: ''
//     },
//     website: ''
//   });
//   const [showPassword, setShowPassword] = useState(false);
//   const [errors, setErrors] = useState({});
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [agreeTerms, setAgreeTerms] = useState(false);
//   const [isGoogleLoading, setIsGoogleLoading] = useState(false);

//   const industryTypes = [
//     'Retail', 'Manufacturing', 'Technology', 'Healthcare', 'Finance',
//     'Education', 'Construction', 'Transportation', 'Hospitality', 'Other'
//   ];

//   const countries = [
//     'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany',
//     'France', 'India', 'Japan', 'Brazil', 'Other'
//   ];

//   const handleChange = (e) => {
//     const { name, value } = e.target;
    
//     if (name.startsWith('company.')) {
//       const companyField = name.split('.')[1];
//       if (companyField === 'street' || companyField === 'city' || companyField === 'country') {
//         setCompanyData(prev => ({
//           ...prev,
//           address: {
//             ...prev.address,
//             [companyField]: value
//           }
//         }));
//       } else {
//         setCompanyData(prev => ({
//           ...prev,
//           [companyField]: value
//         }));
//       }
//     } else {
//       setFormData(prev => ({
//         ...prev,
//         [name]: value
//       }));
//     }
    
//     if (errors[name]) {
//       setErrors(prev => ({
//         ...prev,
//         [name]: ''
//       }));
//     }
//   };

//   const validateForm = () => {
//     const newErrors = {};
    
//     if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
//     if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
//     if (!formData.email.trim()) newErrors.email = 'Email is required';
//     if (!formData.mobile.trim()) newErrors.mobile = 'Mobile number is required';
//     if (!formData.password) newErrors.password = 'Password is required';
//     if (formData.password && formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
//     if (!formData.role) newErrors.role = 'Role is required';
    
//     const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
//     if (formData.email && !emailRegex.test(formData.email)) {
//       newErrors.email = 'Please enter a valid email';
//     }
    
//     if (formData.role && formData.role !== 'Admin') {
//       if (!companyData.name.trim()) newErrors.companyName = 'Company name is required';
//       if (!companyData.registrationNumber.trim()) newErrors.registrationNumber = 'Registration number is required';
//       if (!companyData.taxId.trim()) newErrors.taxId = 'Tax ID is required';
//       if (!companyData.industryType) newErrors.industryType = 'Industry type is required';
//       if (!companyData.address.street.trim()) newErrors.street = 'Street address is required';
//       if (!companyData.address.city.trim()) newErrors.city = 'City is required';
//       if (!companyData.address.country) newErrors.country = 'Country is required';
//     }
    
//     if (!agreeTerms) newErrors.agreeTerms = 'You must agree to the terms and conditions';
    
//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleGoogleSignUp = async () => {
//     try {
//       setIsGoogleLoading(true);
//       const result = await signIn('google', {
//         callbackUrl: '/dashboard',
//         redirect: false, // Set to false to handle redirect manually
//       });
  
//       if (result?.error) {
//         // Handle specific errors
//         if (result.error.includes('OAuthAccountNotLinked')) {
//           toast.error('This email is already associated with another account. Please sign in with your original method.');
//         } else {
//           toast.error(result.error || 'Google sign-up failed');
//         }
//       } else if (result?.url) {
//         // Success - redirect manually
//         window.location.href = result.url;
//       }
//     } catch (error) {
//       console.error("Google sign-up error:", error);
//       toast.error('Google sign-up failed. Please try again.');
//     } finally {
//       setIsGoogleLoading(false);
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     if (!validateForm()) {
//       toast.error('Please fix the errors in the form');
//       return;
//     }
    
//     setIsSubmitting(true);
    
//     try {
//       let companyDetails = null;
//       if (formData.role !== 'Admin') {
//         companyDetails = {
//           name: companyData.name.trim(),
//           registrationNumber: companyData.registrationNumber.trim(),
//           taxId: companyData.taxId.trim(),
//           industryType: companyData.industryType,
//           address: {
//             street: companyData.address.street.trim(),
//             city: companyData.address.city.trim(),
//             country: companyData.address.country
//           },
//           website: companyData.website.trim()
//         };
//       }
  
//       const response = await fetch('/api/user', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           firstName: formData.firstName.trim(),
//           lastName: formData.lastName.trim(),
//           email: formData.email.trim().toLowerCase(),
//           mobile: formData.mobile.trim(),
//           password: formData.password,
//           role: formData.role,
//           companyDetails: companyDetails
//         }),
//       });
      
//       const result = await response.json();
      
//       if (!response.ok) {
//         throw new Error(result.error || 'Failed to create user account');
//       }
      
//       toast.success('Account created successfully! Please check your email for verification.');
//       router.push('/SignInPage');
      
//     } catch (error) {
//       console.error('Signup error:', error);
//       toast.error(error.message || 'Registration failed. Please try again.');
//     } finally {
//       setIsSubmitting(false);
//     }
//   };


"use client";

import React, { useState } from "react";
import {
  Visibility,
  VisibilityOff,
  Business,
  Google,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { signIn } from "next-auth/react";

const SignUpPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
    password: "",
    role: "Corporate",
  });
  const [companyData, setCompanyData] = useState({
    name: "",
    registrationNumber: "",
    taxId: "",
    industryType: "",
    address: {
      street: "",
      city: "",
      country: "",
    },
    website: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const industryTypes = [
    "Retail",
    "Manufacturing",
    "Technology",
    "Healthcare",
    "Finance",
    "Education",
    "Construction",
    "Transportation",
    "Hospitality",
    "Other",
  ];

  const countries = [
    "United States",
    "United Kingdom",
    "Canada",
    "Australia",
    "Germany",
    "France",
    "India",
    "Japan",
    "Brazil",
    "Other",
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith("company.")) {
      const companyField = name.split(".")[1];
      if (["street", "city", "country"].includes(companyField)) {
        setCompanyData((prev) => ({
          ...prev,
          address: {
            ...prev.address,
            [companyField]: value,
          },
        }));
      } else {
        setCompanyData((prev) => ({ ...prev, [companyField]: value }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.mobile.trim()) newErrors.mobile = "Mobile number is required";
    if (!formData.password) newErrors.password = "Password is required";
    if (formData.password && formData.password.length < 8)
      newErrors.password = "Password must be at least 8 characters";

    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (formData.role && formData.role !== "Admin") {
      if (!companyData.name.trim())
        newErrors.companyName = "Company name is required";
      if (!companyData.registrationNumber.trim())
        newErrors.registrationNumber = "Registration number is required";
      if (!companyData.taxId.trim()) newErrors.taxId = "Tax ID is required";
      if (!companyData.industryType)
        newErrors.industryType = "Industry type is required";
      if (!companyData.address.street.trim())
        newErrors.street = "Street address is required";
      if (!companyData.address.city.trim()) newErrors.city = "City is required";
      if (!companyData.address.country)
        newErrors.country = "Country is required";
    }

    if (!agreeTerms)
      newErrors.agreeTerms = "You must agree to the terms and conditions";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGoogleSignUp = async () => {
    try {
      setIsGoogleLoading(true);
      const result = await signIn("google", {
        callbackUrl: "/dashboard",
        redirect: false,
      });

      if (result?.error) {
        router.push(`/auth/error?error=${encodeURIComponent(result.error)}`);
      } else if (result?.url) {
        window.location.href = result.url;
      }
    } catch (error) {
      console.error("Google sign-up error:", error);
      router.push(`/auth/error?error=GoogleSignInFailed`);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setIsSubmitting(true);

    try {
      let companyDetails = null;
      if (formData.role !== "Admin") {
        companyDetails = {
          name: companyData.name.trim(),
          registrationNumber: companyData.registrationNumber.trim(),
          taxId: companyData.taxId.trim(),
          industryType: companyData.industryType,
          address: {
            street: companyData.address.street.trim(),
            city: companyData.address.city.trim(),
            country: companyData.address.country,
          },
          website: companyData.website.trim(),
        };
      }

      const response = await fetch("/api/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          email: formData.email.trim().toLowerCase(),
          companyDetails,
        }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Failed to create user account");

      toast.success("Account created successfully! Please check your email for verification.");
      router.push("/SignInPage");
    } catch (error) {
      console.error("Signup error:", error);
      toast.error(error.message || "Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const showCompanyForm = formData.role && formData.role !== 'Admin';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center py-8 px-4">
      <div className={`max-w-5xl w-full transition-all duration-500 ${showCompanyForm ? 'flex gap-6' : ''}`}>
        <div className={`bg-white p-6 rounded-lg shadow-md ${showCompanyForm ? 'w-1/2' : 'w-full mx-auto'}`}>
          <div className="flex flex-col items-center">
            <h1 className="text-xl font-bold mb-4 text-gray-800">Create Account</h1>
            
            <div className="w-full mb-4">
              <button
                type="button"
                onClick={handleGoogleSignUp}
                disabled={isGoogleLoading}
                className={`w-full py-2 px-4 border border-gray-300 rounded text-sm flex items-center justify-center ${
                  isGoogleLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-gray-50'
                }`}
              >
                <Google className="text-gray-500 mr-2" fontSize="small" />
                {isGoogleLoading ? 'Signing up...' : 'Sign up with Google'}
              </button>
            </div>
            
            <div className="flex items-center my-4 w-full">
              <div className="flex-grow border-t border-gray-300"></div>
              <span className="mx-2 text-xs text-gray-500">or</span>
              <div className="flex-grow border-t border-gray-300"></div>
            </div>
            
            <form onSubmit={handleSubmit} className="w-full">
              <h2 className="text-sm font-bold mb-3 text-gray-700 border-b pb-2">Personal Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                <div className="w-full">
                  <label className="block text-xs font-bold text-gray-700 mb-1">First Name *</label>
                  <input
                    name="firstName"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={handleChange}
                    className={`w-full p-2.5 text-sm border rounded-md ${errors.firstName ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                </div>
                
                <div className="w-full">
                  <label className="block text-xs font-bold text-gray-700 mb-1">Last Name *</label>
                  <input
                    name="lastName"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={handleChange}
                    className={`w-full p-2.5 text-sm border rounded-md ${errors.lastName ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
                </div>
                
                <div className="w-full">
                  <label className="block text-xs font-bold text-gray-700 mb-1">Email Address *</label>
                  <input
                    name="email"
                    type="email"
                    placeholder="john.doe@email.com"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full p-2.5 text-sm border rounded-md ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>
                
                <div className="w-full">
                  <label className="block text-xs font-bold text-gray-700 mb-1">Mobile Number *</label>
                  <input
                    name="mobile"
                    placeholder="+94 77 123 4567"
                    value={formData.mobile}
                    onChange={handleChange}
                    className={`w-full p-2.5 text-sm border rounded-md ${errors.mobile ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.mobile && <p className="text-red-500 text-xs mt-1">{errors.mobile}</p>}
                </div>
                
                <div className="w-full">
                  <label className="block text-xs font-bold text-gray-700 mb-1">Password *</label>
                  <div className="relative">
                    <input
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••"
                      value={formData.password}
                      onChange={handleChange}
                      className={`w-full p-2.5 pr-8 text-sm border rounded-md ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    <button
                      type="button"
                      onClick={handleClickShowPassword}
                      className="absolute inset-y-0 right-0 pr-2 flex items-center text-sm"
                    >
                      {showPassword ? <VisibilityOff className="text-gray-500" fontSize="small" /> : <Visibility className="text-gray-500" fontSize="small" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                </div>
              </div>
              
              <h2 className="text-sm font-bold mt-5 mb-3 text-gray-700 border-b pb-2">Role Selection</h2>
              
              <div className="mb-4">
                <div className="w-full">
                  <label className="block text-xs font-bold text-gray-700 mb-1">Select Role *</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className={`w-full p-2.5 text-sm border rounded-md ${errors.role ? 'border-red-500' : 'border-gray-300'}`}
                  >
                    <option value="Corporate">Corporate</option>
                    <option value="Dealer">Dealer</option>
                    <option value="Marketing Agency">Marketing Agency</option>
                    <option value="Admin">Admin (Platform-level)</option>
                  </select>
                  {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role}</p>}
                </div>
              </div>
              
              <div className="flex items-center mb-4 mt-5">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="terms" className="ml-2 block text-xs text-gray-700">
                  I agree to the Terms and Conditions
                </label>
              </div>
              {errors.agreeTerms && <p className="text-red-500 text-xs mt-1 mb-2">{errors.agreeTerms}</p>}
              
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3 px-4 rounded-md text-sm font-medium mb-4 ${
                  isSubmitting 
                    ? 'bg-blue-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {isSubmitting ? 'Creating Account...' : 'Create Account'}
              </button>
              
              <div className="text-center">
                <span className="text-xs text-gray-600">
                  Already have an account?{' '}
                </span>
                <a href="/SignInPage" className="text-xs font-bold text-blue-600 hover:underline">
                  Sign in
                </a>
              </div>
            </form>
          </div>
        </div>

        {showCompanyForm && (
          <div className="w-1/2 bg-white p-6 rounded-lg shadow-md transition-all duration-500 animate-fadeIn">
            <div className="flex items-center mb-4">
              <Business className="text-blue-600 mr-2" />
              <h2 className="text-lg font-bold text-gray-800">Company Details</h2>
            </div>
            
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
              <div className="grid grid-cols-1 gap-3">
                <div className="w-full">
                  <label className="block text-xs font-bold text-gray-700 mb-1">Company Name *</label>
                  <input
                    name="company.name"
                    value={companyData.name}
                    onChange={handleChange}
                    className={`w-full p-2.5 text-sm border rounded-md ${errors.companyName ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.companyName && <p className="text-red-500 text-xs mt-1">{errors.companyName}</p>}
                </div>
                
                <div className="w-full">
                  <label className="block text-xs font-bold text-gray-700 mb-1">Registration Number *</label>
                  <input
                    name="company.registrationNumber"
                    value={companyData.registrationNumber}
                    onChange={handleChange}
                    className={`w-full p-2.5 text-sm border rounded-md ${errors.registrationNumber ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.registrationNumber && <p className="text-red-500 text-xs mt-1">{errors.registrationNumber}</p>}
                </div>
                
                <div className="w-full">
                  <label className="block text-xs font-bold text-gray-700 mb-1">Tax ID / VAT / GST *</label>
                  <input
                    name="company.taxId"
                    value={companyData.taxId}
                    onChange={handleChange}
                    className={`w-full p-2.5 text-sm border rounded-md ${errors.taxId ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.taxId && <p className="text-red-500 text-xs mt-1">{errors.taxId}</p>}
                </div>
                
                <div className="w-full">
                  <label className="block text-xs font-bold text-gray-700 mb-1">Industry Type *</label>
                  <select
                    name="company.industryType"
                    value={companyData.industryType}
                    onChange={handleChange}
                    className={`w-full p-2.5 text-sm border rounded-md ${errors.industryType ? 'border-red-500' : 'border-gray-300'}`}
                  >
                    <option value="">Select industry</option>
                    {industryTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  {errors.industryType && <p className="text-red-500 text-xs mt-1">{errors.industryType}</p>}
                </div>
                
                <div className="w-full">
                  <label className="block text-xs font-bold text-gray-700 mb-1">Street Address *</label>
                  <input
                    name="company.street"
                    placeholder="Street address"
                    value={companyData.address.street}
                    onChange={handleChange}
                    className={`w-full p-2.5 text-sm border rounded-md ${errors.street ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.street && <p className="text-red-500 text-xs mt-1">{errors.street}</p>}
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="w-full">
                    <label className="block text-xs font-bold text-gray-700 mb-1">City *</label>
                    <input
                      name="company.city"
                      placeholder="City"
                      value={companyData.address.city}
                      onChange={handleChange}
                      className={`w-full p-2.5 text-sm border rounded-md ${errors.city ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                  </div>
                  
                  <div className="w-full">
                    <label className="block text-xs font-bold text-gray-700 mb-1">Country *</label>
                    <select
                      name="company.country"
                      value={companyData.address.country}
                      onChange={handleChange}
                      className={`w-full p-2.5 text-sm border rounded-md ${errors.country ? 'border-red-500' : 'border-gray-300'}`}
                    >
                      <option value="">Select country</option>
                      {countries.map(country => (
                        <option key={country} value={country}>{country}</option>
                      ))}
                    </select>
                    {errors.country && <p className="text-red-500 text-xs mt-1">{errors.country}</p>}
                  </div>
                </div>
                
                <div className="w-full">
                  <label className="block text-xs font-bold text-gray-700 mb-1">Website (Optional)</label>
                  <input
                    name="company.website"
                    placeholder="https://yourcompany.com"
                    value={companyData.website}
                    onChange={handleChange}
                    className="w-full p-2.5 text-sm border border-gray-300 rounded-md"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SignUpPage;