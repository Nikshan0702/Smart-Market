"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { Visibility, VisibilityOff, Google, Facebook } from '@mui/icons-material';
import { signIn } from 'next-auth/react';

const SignInPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when field is updated
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
  
    setIsLoading(true);
  
    try {
      const response = await fetch('/api/user/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email.trim().toLowerCase(),
          password: formData.password
        }),
      });
  
      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        throw new Error(text || 'Invalid server response');
      }
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.message || data.error || 'Login failed');
      }
  
      if (!data.token) {
        throw new Error('Authentication token missing');
      }
  
      // Store token
      localStorage.setItem('authToken', data.token);
      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true');
      }
  
      toast.success('Logged in successfully!');
      router.push('/Dashboard'); // Redirect to dashboard or home page
  
    } catch (error) {
      console.error("Login error:", error);
      toast.error(error.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsGoogleLoading(true);
      const result = await signIn("google", {
        callbackUrl: "/Dashboard",
        redirect: false,
      });

      if (result?.error) {
        toast.error("Google sign-in failed. Please try again.");
        console.error("Google sign-in error:", result.error);
      } else if (result?.url) {
        window.location.href = result.url;
      }
    } catch (error) {
      console.error("Google sign-in error:", error);
      toast.error("Google sign-in failed. Please try again.");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center py-4 px-4">
      <div className="max-w-xs w-full">
        <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
          <h1 className="text-2xl font-bold mb-4 text-[#288984]">Sign in</h1>
          
          <form onSubmit={handleSubmit} className="w-full">
            <div className="mb-3">
              <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={handleChange}
                className={`w-full p-2 text-sm border rounded ${errors.email ? 'border-red-500' : 'border-[#98F4F0]'}`}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>
            
            <div className="mb-2">
              <label htmlFor="password" className="block text-sm font-bold text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full p-2 pr-8 text-sm border rounded ${errors.password ? 'border-red-500' : 'border-[#98F4F0]'}`}
                />
                <button
                  type="button"
                  onClick={handleClickShowPassword}
                  className="absolute inset-y-0 right-0 pr-2 flex items-center"
                >
                  {!showPassword ? <VisibilityOff className="text-[#288984]" fontSize="small" /> : <Visibility className="text-[#5BB5B1]" fontSize="small" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>
            
            <div className="flex items-center mb-3">
              <input
                id="rememberMe"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 accent-[#288984] focus:ring-[#5BB5B1] border-gray-300 rounded"
              />
              <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700">
                Remember me
              </label>
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-2 px-4 rounded text-sm font-medium mb-3 ${
                isLoading 
                  ? 'bg-[#2A9691] cursor-not-allowed' 
                  : 'bg-[#288984] hover:bg-[#2A9691] text-white'
              }`}
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
            
            <div className="text-center mb-3">
              <a href="/forgot-password" className="text-sm text-[#5BB5B1] hover:underline">
                Forgot your password?
              </a>
            </div>
            
            <div className="flex items-center my-3">
              <div className="flex-grow border-t border-[#98F4F0]"></div>
              <span className="mx-2 text-xs text-gray-500">or</span>
              <div className="flex-grow border-t border-[#98F4F0]"></div>
            </div>
            
            <div className="flex flex-col gap-2 mb-3">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isGoogleLoading}
                className={`w-full py-1.5 px-4 border border-[#98F4F0] rounded text-sm flex items-center justify-center ${
                  isGoogleLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#D4FFFD]'
                }`}
              >
                <Google className="text-black mr-2" fontSize="small" />
                {isGoogleLoading ? 'Signing in...' : 'Sign in with Google'}
              </button>
            </div>
            
            <div className="text-center">
              <span className="text-sm text-gray-600">
                Don't have an account?{' '}
              </span>
              <a href="/SignUpPage" className="text-sm font-bold text-[#288984] hover:underline">
                Sign up
              </a>
            </div>
          </form>
        </div>
        
        <p className="text-center text-xs text-gray-500 mt-2">
          © {new Date().getFullYear()} DATTREO. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default SignInPage;