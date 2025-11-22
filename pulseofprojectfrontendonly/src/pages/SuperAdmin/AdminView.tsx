import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowBack as BackIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Business as BusinessIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon,
  Edit as EditIcon,
} from '@mui/icons-material';

interface AdminDetails {
  id: string;
  name: string;
  email: string;
  phone?: string;
  username: string;
  role: string;
  status: string;
  organizationId?: string;
  organizationName?: string;
  stateName?: string;
  stateCode?: string;
  totalTenants: number;
  activeTenants: number;
  createdAt: string;
  lastActive?: string;
}

export function AdminView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [admin, setAdmin] = useState<AdminDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAdminDetails();
  }, [id]);

  async function loadAdminDetails() {
    try {
      setLoading(true);
      const token = localStorage.getItem('pulseofpeople_access_token');

      const response = await fetch(`http://127.0.0.1:8000/api/superadmin/users/${id}/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load admin details');
      }

      const data = await response.json();

      console.log('Backend API response:', data); // Debug log

      // Transform backend nested profile data to match AdminDetails interface
      const transformedData: AdminDetails = {
        id: data.id?.toString() || '',
        name: (data.first_name || data.last_name)
          ? `${data.first_name || ''} ${data.last_name || ''}`.trim()
          : data.name || '',
        email: data.email || '',
        phone: data.profile?.phone || '',  // Nested under profile
        username: data.username || '',
        role: data.role || data.profile?.role || '',
        status: data.is_active === false ? 'inactive' : 'active',
        organizationId: data.profile?.organization?.toString() || data.profile?.organization_id?.toString() || '',
        organizationName: data.profile?.organization_name || '',
        stateName: data.profile?.assigned_state_name || '',
        stateCode: data.profile?.state_code || '',
        totalTenants: 0,  // Not available in response
        activeTenants: 0,  // Not available in response
        createdAt: data.date_joined || '',
        lastActive: data.last_login || '',
      };

      setAdmin(transformedData);
    } catch (err: any) {
      console.error('Failed to load admin:', err);
      setError(err.message || 'Failed to load admin details');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin details...</p>
        </div>
      </div>
    );
  }

  if (error || !admin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Admin not found'}</p>
          <button
            onClick={() => navigate('/super-admin/admins')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Admin List
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 -mx-8 -mt-6 mb-8">
        <div className="px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/super-admin/admins')}
                className="text-gray-400 hover:text-gray-600"
              >
                <BackIcon className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Details</h1>
                <p className="text-sm text-gray-500">View state admin information</p>
              </div>
            </div>
            <button
              onClick={() => navigate(`/super-admin/admins/${id}/edit`)}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <EditIcon className="w-5 h-5 mr-2" />
              Edit Admin
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-6">
        {/* Personal Information Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <PersonIcon className="w-5 h-5 mr-2 text-blue-600" />
            Personal Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Full Name</label>
              <p className="text-gray-900 font-medium">{admin.name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Username</label>
              <p className="text-gray-900">{admin.username}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
              <div className="flex items-center text-gray-900">
                <EmailIcon className="w-4 h-4 mr-2 text-gray-400" />
                {admin.email}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Phone</label>
              <div className="flex items-center text-gray-900">
                <PhoneIcon className="w-4 h-4 mr-2 text-gray-400" />
                {admin.phone || 'Not provided'}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Role</label>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                {admin.role}
              </span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Status</label>
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  admin.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {admin.status === 'active' ? (
                  <ActiveIcon className="w-4 h-4 mr-1" />
                ) : (
                  <InactiveIcon className="w-4 h-4 mr-1" />
                )}
                {admin.status}
              </span>
            </div>
          </div>
        </div>

        {/* Organization Information Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BusinessIcon className="w-5 h-5 mr-2 text-purple-600" />
            Organization Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Organization</label>
              <p className="text-gray-900 font-medium">{admin.organizationName || 'Not assigned'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">State</label>
              <div className="flex items-center text-gray-900">
                <LocationIcon className="w-4 h-4 mr-2 text-gray-400" />
                {admin.stateName ? `${admin.stateName} (${admin.stateCode})` : 'Not assigned'}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Total Tenants</label>
              <p className="text-2xl font-bold text-gray-900">{admin.totalTenants}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Active Tenants</label>
              <p className="text-2xl font-bold text-green-600">{admin.activeTenants}</p>
            </div>
          </div>
        </div>

        {/* Activity Information Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <CalendarIcon className="w-5 h-5 mr-2 text-gray-600" />
            Activity Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Created At</label>
              <p className="text-gray-900">
                {new Date(admin.createdAt).toLocaleString('en-IN', {
                  dateStyle: 'long',
                  timeStyle: 'short',
                })}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Last Active</label>
              <p className="text-gray-900">
                {admin.lastActive
                  ? new Date(admin.lastActive).toLocaleString('en-IN', {
                      dateStyle: 'long',
                      timeStyle: 'short',
                    })
                  : 'Never'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminView;
