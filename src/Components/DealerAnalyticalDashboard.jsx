"use client";

import { useState, useEffect } from 'react';
import {
  BuildingStorefrontIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  UserGroupIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const DealerAnalyticsDashboard = () => {
  const [analytics, setAnalytics] = useState({
    warehouseStats: {},
    tenderStats: {},
    bookingTrends: [],
    revenueData: [],
    recentActivities: []
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30days'); // 7days, 30days, 90days

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const authToken = localStorage.getItem('authToken');
      
      // Fetch warehouse analytics
      const warehouseResponse = await fetch(`/api/analytics/warehouses?range=${timeRange}`, {
        headers: {
          "Content-Type": "application/json",
          ...(authToken && { "Authorization": `Bearer ${authToken}` })
        },
      });

      // Fetch tender analytics
      const tenderResponse = await fetch(`/api/analytics/tenders?range=${timeRange}`, {
        headers: {
          "Content-Type": "application/json",
          ...(authToken && { "Authorization": `Bearer ${authToken}` })
        },
      });

      if (warehouseResponse.ok && tenderResponse.ok) {
        const warehouseData = await warehouseResponse.json();
        const tenderData = await tenderResponse.json();
        
        setAnalytics({
          warehouseStats: warehouseData.stats || {},
          tenderStats: tenderData.stats || {},
          bookingTrends: warehouseData.trends || [],
          revenueData: warehouseData.revenue || [],
          recentActivities: [...(warehouseData.activities || []), ...(tenderData.activities || [])]
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, 10)
        });
      } else {
        throw new Error('Failed to fetch analytics data');
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate derived metrics
  const calculateMetrics = () => {
    const { warehouseStats, tenderStats } = analytics;
    
    return {
      totalRevenue: warehouseStats.totalRevenue || 0,
      occupancyRate: warehouseStats.totalArea ? 
        ((warehouseStats.bookedArea || 0) / warehouseStats.totalArea * 100) : 0,
      bookingConversion: warehouseStats.totalRequests ? 
        ((warehouseStats.confirmedBookings || 0) / warehouseStats.totalRequests * 100) : 0,
      tenderSuccessRate: tenderStats.totalQuotes ? 
        ((tenderStats.approvedQuotes || 0) / tenderStats.totalQuotes * 100) : 0,
      activeBookings: warehouseStats.activeBookings || 0,
      pendingTenders: tenderStats.pendingQuotes || 0
    };
  };

  const metrics = calculateMetrics();

  const StatCard = ({ title, value, subtitle, icon: Icon, trend, color = 'blue' }) => {
    const colorClasses = {
      blue: 'bg-blue-50 text-blue-600',
      green: 'bg-green-50 text-green-600',
      orange: 'bg-orange-50 text-orange-600',
      purple: 'bg-purple-50 text-purple-600',
      red: 'bg-red-50 text-red-600'
    };

    return (
      <div className="bg-white rounded-lg p-6 border shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
            {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
            {trend && (
              <p className={`text-sm mt-1 ${
                trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-600'
              }`}>
                {trend > 0 ? '↑' : trend < 0 ? '↓' : '→'} {Math.abs(trend)}%
              </p>
            )}
          </div>
          <div className={`p-3 rounded-full ${colorClasses[color]}`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </div>
    );
  };

  const ProgressCard = ({ title, value, max, subtitle, color = 'blue' }) => {
    const percentage = max > 0 ? (value / max * 100) : 0;
    
    const colorClasses = {
      blue: 'bg-blue-200',
      green: 'bg-green-200',
      orange: 'bg-orange-200',
      purple: 'bg-purple-200'
    };

    const barColors = {
      blue: 'bg-blue-600',
      green: 'bg-green-600',
      orange: 'bg-orange-600',
      purple: 'bg-purple-600'
    };

    return (
      <div className="bg-white rounded-lg p-6 border shadow-sm">
        <div className="flex justify-between items-start mb-2">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{percentage.toFixed(1)}%</p>
          </div>
          <p className="text-sm text-gray-500">{value} / {max}</p>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full ${barColors[color]}`}
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
        {subtitle && <p className="text-sm text-gray-500 mt-2">{subtitle}</p>}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg p-6 border shadow-sm">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="bg-gray-100 p-6 rounded-lg h-32"></div>
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
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Analytics Dashboard</h1>
            <p className="text-gray-600">Overview of your warehouse performance and tender activities</p>
          </div>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          >
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 90 Days</option>
          </select>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value={`$${(metrics.totalRevenue / 1000).toFixed(1)}K`}
          subtitle="From warehouse bookings"
          icon={CurrencyDollarIcon}
          color="green"
          trend={12.5}
        />
        
        <StatCard
          title="Occupancy Rate"
          value={`${metrics.occupancyRate.toFixed(1)}%`}
          subtitle="Warehouse space utilization"
          icon={BuildingStorefrontIcon}
          color="blue"
          trend={8.2}
        />
        
        <StatCard
          title="Active Bookings"
          value={metrics.activeBookings}
          subtitle="Current warehouse bookings"
          icon={CalendarIcon}
          color="orange"
          trend={15.3}
        />
        
        <StatCard
          title="Pending Tenders"
          value={metrics.pendingTenders}
          subtitle="Quotes awaiting response"
          icon={DocumentTextIcon}
          color="purple"
          trend={-5.2}
        />
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ProgressCard
          title="Booking Conversion Rate"
          value={analytics.warehouseStats.confirmedBookings || 0}
          max={analytics.warehouseStats.totalRequests || 1}
          subtitle="Booking requests to confirmed"
          color="green"
        />
        
        <ProgressCard
          title="Tender Success Rate"
          value={analytics.tenderStats.approvedQuotes || 0}
          max={analytics.tenderStats.totalQuotes || 1}
          subtitle="Quotes approved vs submitted"
          color="purple"
        />
        
        <ProgressCard
          title="Space Utilization"
          value={analytics.warehouseStats.bookedArea || 0}
          max={analytics.warehouseStats.totalArea || 1}
          subtitle="Booked vs total available area"
          color="blue"
        />
      </div>

      {/* Charts and Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <div className="bg-white rounded-lg p-6 border shadow-sm">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <ArrowTrendingUpIcon className="h-5 w-5 text-green-600" />
            Revenue Trend
          </h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            {analytics.revenueData.length > 0 ? (
              <div className="text-center">
                <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Revenue chart would be displayed here</p>
                <p className="text-sm text-gray-400 mt-1">
                  Total: ${metrics.totalRevenue.toLocaleString()}
                </p>
              </div>
            ) : (
              <div className="text-center">
                <CurrencyDollarIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">No revenue data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Booking Trends */}
        <div className="bg-white rounded-lg p-6 border shadow-sm">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <ChartBarIcon className="h-5 w-5 text-blue-600" />
            Booking Trends
          </h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            {analytics.bookingTrends.length > 0 ? (
              <div className="text-center">
                <BuildingStorefrontIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Booking trends chart would be displayed here</p>
                <p className="text-sm text-gray-400 mt-1">
                  {analytics.bookingTrends.length} periods tracked
                </p>
              </div>
            ) : (
              <div className="text-center">
                <ClockIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">No booking trend data available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg p-6 border shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {analytics.recentActivities.length > 0 ? (
            analytics.recentActivities.map((activity, index) => (
              <div key={index} className="flex items-center gap-4 p-3 border rounded-lg">
                <div className={`p-2 rounded-full ${
                  activity.type === 'booking' ? 'bg-blue-100' : 
                  activity.type === 'tender' ? 'bg-purple-100' : 'bg-gray-100'
                }`}>
                  {activity.type === 'booking' ? (
                    <BuildingStorefrontIcon className="h-5 w-5 text-blue-600" />
                  ) : activity.type === 'tender' ? (
                    <DocumentTextIcon className="h-5 w-5 text-purple-600" />
                  ) : (
                    <UserGroupIcon className="h-5 w-5 text-gray-600" />
                  )}
                </div>
                
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{activity.title}</p>
                  <p className="text-sm text-gray-500">{activity.description}</p>
                </div>
                
                <div className="text-right">
                  <p className="text-sm text-gray-500">
                    {new Date(activity.timestamp).toLocaleDateString()}
                  </p>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    activity.status === 'completed' ? 'bg-green-100 text-green-800' :
                    activity.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    activity.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {activity.status}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <ClockIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">No recent activities</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Warehouse Summary */}
        <div className="bg-white rounded-lg p-6 border shadow-sm">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <BuildingStorefrontIcon className="h-5 w-5 text-blue-600" />
            Warehouse Summary
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Warehouses</span>
              <span className="font-semibold">{analytics.warehouseStats.totalWarehouses || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Active Warehouses</span>
              <span className="font-semibold">{analytics.warehouseStats.activeWarehouses || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Bookings</span>
              <span className="font-semibold">{analytics.warehouseStats.totalBookings || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Pending Requests</span>
              <span className="font-semibold">{analytics.warehouseStats.pendingRequests || 0}</span>
            </div>
          </div>
        </div>

        {/* Tender Summary */}
        <div className="bg-white rounded-lg p-6 border shadow-sm">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <DocumentTextIcon className="h-5 w-5 text-purple-600" />
            Tender Summary
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Quotes Submitted</span>
              <span className="font-semibold">{analytics.tenderStats.totalQuotes || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Approved Quotes</span>
              <span className="font-semibold">{analytics.tenderStats.approvedQuotes || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Pending Review</span>
              <span className="font-semibold">{analytics.tenderStats.pendingQuotes || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Rejected Quotes</span>
              <span className="font-semibold">{analytics.tenderStats.rejectedQuotes || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DealerAnalyticsDashboard;