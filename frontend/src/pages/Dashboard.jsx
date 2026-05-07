import { useQuery } from 'react-query';
import { analyticsAPI, aiAPI } from '../services/api';
import { useAuthStore } from '../store/authStore';
import {
  ChartBarIcon,
  UsersIcon,
  ShoppingCartIcon,
  TrendingUpIcon,
  ClockIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

const StatCard = ({ title, value, icon: Icon, trend, color = 'blue' }) => {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    purple: 'bg-purple-500',
    red: 'bg-red-500',
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {trend && (
            <p className={`text-sm mt-2 ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% from last month
            </p>
          )}
        </div>
        <div className={`${colorClasses[color]} p-4 rounded-lg`}>
          <Icon className="h-8 w-8 text-white" />
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { userType } = useAuthStore();

  // Fetch dashboard data
  const { data: dashboardData, isLoading } = useQuery(
    'dashboard',
    () => analyticsAPI.getDashboard(),
    {
      refetchInterval: 60000, // Refetch every minute
    }
  );

  const stats = dashboardData?.data || {};

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Welcome back! Here's what's happening with your {userType === 'vendor' ? 'orders' : 'vendors'}.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {userType === 'user' ? (
          <>
            <StatCard
              title="Total Vendors"
              value={stats.totalVendors || 0}
              icon={UsersIcon}
              trend={5.2}
              color="blue"
            />
            <StatCard
              title="Active Orders"
              value={stats.activeOrders || 0}
              icon={ShoppingCartIcon}
              trend={12.5}
              color="green"
            />
            <StatCard
              title="Pending Approvals"
              value={stats.pendingApprovals || 0}
              icon={ClockIcon}
              color="yellow"
            />
            <StatCard
              title="Completed This Month"
              value={stats.completedThisMonth || 0}
              icon={CheckCircleIcon}
              trend={8.1}
              color="purple"
            />
          </>
        ) : (
          <>
            <StatCard
              title="Total Orders"
              value={stats.totalOrders || 0}
              icon={ShoppingCartIcon}
              color="blue"
            />
            <StatCard
              title="Active Orders"
              value={stats.activeOrders || 0}
              icon={ClockIcon}
              color="green"
            />
            <StatCard
              title="Completed Orders"
              value={stats.completedOrders || 0}
              icon={CheckCircleIcon}
              color="purple"
            />
            <StatCard
              title="Performance Rating"
              value={`${stats.performanceRating || 0}/5`}
              icon={TrendingUpIcon}
              color="yellow"
            />
          </>
        )}
      </div>

      {/* Charts and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Recent Orders</h2>
          <div className="space-y-3">
            {stats.recentOrders?.slice(0, 5).map((order) => (
              <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{order.orderNumber}</p>
                  <p className="text-sm text-gray-600">{order.vendor}</p>
                </div>
                <span className={`badge badge-${order.status === 'Completed' ? 'success' : 'warning'}`}>
                  {order.status}
                </span>
              </div>
            )) || (
              <p className="text-gray-500 text-center py-4">No recent orders</p>
            )}
          </div>
        </div>

        {/* Top Vendors */}
        {userType === 'user' && (
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Top Performing Vendors</h2>
            <div className="space-y-3">
              {stats.topVendors?.slice(0, 5).map((vendor, index) => (
                <div key={vendor.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="font-bold text-gray-400">#{index + 1}</span>
                    <div>
                      <p className="font-medium">{vendor.name}</p>
                      <p className="text-sm text-gray-600">{vendor.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-yellow-600">★ {vendor.rating}</p>
                    <p className="text-xs text-gray-500">{vendor.orders} orders</p>
                  </div>
                </div>
              )) || (
                <p className="text-gray-500 text-center py-4">No vendor data available</p>
              )}
            </div>
          </div>
        )}

        {/* AI Insights */}
        {userType === 'user' && (
          <div className="card lg:col-span-2">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <ChartBarIcon className="h-6 w-6 mr-2 text-primary-600" />
              AI-Powered Insights
            </h2>
            <div className="bg-gradient-to-r from-primary-50 to-purple-50 p-4 rounded-lg">
              <p className="text-gray-700 leading-relaxed">
                {stats.aiInsights || 'Analyzing your vendor and order data to generate insights...'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {userType === 'user' ? (
            <>
              <button className="btn btn-primary">
                Create New Order
              </button>
              <button className="btn btn-secondary">
                Add Vendor
              </button>
              <button className="btn btn-secondary">
                Generate Report
              </button>
            </>
          ) : (
            <>
              <button className="btn btn-primary">
                View Orders
              </button>
              <button className="btn btn-secondary">
                Update Profile
              </button>
              <button className="btn btn-secondary">
                Upload Documents
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

// Made with Bob
