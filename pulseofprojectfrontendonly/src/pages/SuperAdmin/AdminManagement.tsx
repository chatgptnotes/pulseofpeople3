import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  People as PeopleIcon,
  Add as AddIcon,
  Search as SearchIcon,
  MoreVert as MoreIcon,
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon,
  Business as BusinessIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Edit as EditIcon,
  Block as BlockIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { usePermission } from '../../hooks/usePermission';

interface Admin {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  status: string;
  organizationId?: string;
  organizationName?: string;
  stateName?: string;
  totalTenants: number;
  activeTenants: number;
  createdAt: string;
  lastActive?: string;
}

export function AdminManagement() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isSuperAdmin = usePermission('manage_organizations');

  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [showActionsMenu, setShowActionsMenu] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: '',
    phone: '',
    password: '',
    confirmPassword: '',
    organizationName: '',
    stateId: '',
    organizationId: '',
    subdomain: '',
  });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [states, setStates] = useState<{id: number, name: string, code: string}[]>([]);
  const [organizations, setOrganizations] = useState<{id: number, name: string}[]>([]);
  const [subdomainStatus, setSubdomainStatus] = useState<{
    checking: boolean;
    available: boolean | null;
    message: string;
    preview: string;
  }>({
    checking: false,
    available: null,
    message: '',
    preview: '',
  });

  useEffect(() => {
    if (!isSuperAdmin) {
      navigate('/unauthorized');
      return;
    }

    loadAdmins();
  }, [isSuperAdmin, navigate, filterStatus]);

  // Load states and organizations when modal opens
  useEffect(() => {
    if (showCreateModal) {
      loadStatesAndOrganizations();
    }
  }, [showCreateModal]);

  // Debounced subdomain availability check
  useEffect(() => {
    if (!formData.subdomain || formData.subdomain.length < 2) {
      setSubdomainStatus({
        checking: false,
        available: null,
        message: '',
        preview: '',
      });
      return;
    }

    const timeoutId = setTimeout(() => {
      checkSubdomainAvailability(formData.subdomain);
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [formData.subdomain]);

  async function checkSubdomainAvailability(subdomain: string) {
    try {
      setSubdomainStatus({
        checking: true,
        available: null,
        message: 'Checking availability...',
        preview: '',
      });

      const token = localStorage.getItem('pulseofpeople_access_token');
      const response = await fetch('http://127.0.0.1:8000/api/superadmin/users/check_subdomain/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ subdomain }),
      });

      const data = await response.json();

      setSubdomainStatus({
        checking: false,
        available: data.available,
        message: data.available
          ? '✓ Subdomain is available!'
          : (data.error || 'Subdomain is not available'),
        preview: data.preview || '',
      });
    } catch (error) {
      console.error('Failed to check subdomain:', error);
      setSubdomainStatus({
        checking: false,
        available: false,
        message: 'Failed to check subdomain availability',
        preview: '',
      });
    }
  }

  async function loadStatesAndOrganizations() {
    try {
      const token = localStorage.getItem('pulseofpeople_access_token');

      // Fetch states
      const statesResponse = await fetch('http://127.0.0.1:8000/api/superadmin/users/states/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (statesResponse.ok) {
        const statesData = await statesResponse.json();
        setStates(statesData.states || []);
      }

      // Fetch organizations
      const orgsResponse = await fetch('http://127.0.0.1:8000/api/superadmin/tenants/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (orgsResponse.ok) {
        const orgsData = await orgsResponse.json();
        const orgsList = orgsData.tenants || [];
        setOrganizations(orgsList.map((org: any) => ({
          id: org.id,
          name: org.party_name || org.name
        })));
      }
    } catch (error) {
      console.error('Failed to load states and organizations:', error);
    }
  }

  async function refreshToken() {
    try {
      const refresh = localStorage.getItem('pulseofpeople_refresh_token');
      if (!refresh) {
        console.error('No refresh token available - please login again');
        return null;
      }

      const response = await fetch('http://127.0.0.1:8000/api/auth/refresh/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh }),
      });

      if (!response.ok) {
        console.error('Token refresh failed - please login again');
        return null;
      }

      const data = await response.json();
      localStorage.setItem('pulseofpeople_access_token', data.access);
      return data.access;
    } catch (error) {
      console.error('Token refresh error:', error);
      return null;
    }
  }

  async function loadAdmins() {
    try {
      setLoading(true);

      // Call Django API to get state admins
      let token = localStorage.getItem('pulseofpeople_access_token');
      let response = await fetch('http://127.0.0.1:8000/api/superadmin/users/state_admins/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      // If 401, try refreshing token once
      if (response.status === 401) {
        console.log('Token expired, refreshing...');
        token = await refreshToken();
        if (token) {
          // Retry with new token
          response = await fetch('http://127.0.0.1:8000/api/superadmin/users/state_admins/', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          });
        } else {
          return; // Already redirected to login
        }
      }

      if (!response.ok) {
        throw new Error('Failed to fetch admins');
      }

      const data = await response.json();
      setAdmins(data.admins || []);
    } catch (error) {
      console.error('Failed to load admins:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredAdmins = admins.filter(
    (admin) =>
      admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.organizationName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }

  async function handleSuspendAdmin(admin: Admin) {
    if (!confirm(`Are you sure you want to suspend ${admin.name}?`)) {
      return;
    }

    try {
      // TODO: Implement Django API endpoint for suspending admin
      console.log('Suspending admin:', admin.id);
      alert('Admin suspend functionality will be implemented with Django API');
      setShowActionsMenu(null);
    } catch (error) {
      console.error('Failed to suspend admin:', error);
      alert('Failed to suspend admin. Please try again.');
    }
  }

  async function handleActivateAdmin(admin: Admin) {
    try {
      // TODO: Implement Django API endpoint for activating admin
      console.log('Activating admin:', admin.id);
      alert('Admin activate functionality will be implemented with Django API');
      setShowActionsMenu(null);
    } catch (error) {
      console.error('Failed to activate admin:', error);
      alert('Failed to activate admin. Please try again.');
    }
  }

  async function handleDeleteAdmin(admin: Admin) {
    if (!confirm(`Are you sure you want to delete ${admin.name}? This action cannot be undone.`)) {
      return;
    }

    try {
      const token = localStorage.getItem('pulseofpeople_access_token');
      const response = await fetch(`http://127.0.0.1:8000/api/superadmin/users/${admin.id}/`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        // Try to get error message from response
        let errorMessage = 'Failed to delete admin';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.detail || errorMessage;
        } catch (e) {
          // If JSON parsing fails, use default message
        }
        throw new Error(errorMessage);
      }

      // Success - close menu and refresh the list
      setShowActionsMenu(null);
      await loadAdmins();
      alert(`${admin.name} has been deleted successfully.`);
    } catch (error: any) {
      console.error('Failed to delete admin:', error);
      alert(`Failed to delete admin: ${error.message || 'Please try again.'}`);
    }
  }

  async function handleCreateAdmin(e: React.FormEvent) {
    e.preventDefault();
    setCreateError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setCreateError('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setCreateError('Password must be at least 8 characters');
      return;
    }

    if (!formData.stateId) {
      setCreateError('Please select a state');
      return;
    }

    if (!formData.organizationId) {
      setCreateError('Please select an organization');
      return;
    }

    try {
      setCreating(true);

      // Split name into first and last name
      const nameParts = formData.name.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      // Call Django API to create state admin
      const requestBody: any = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        first_name: firstName,
        last_name: lastName,
        phone: formData.phone,
        state_id: parseInt(formData.stateId),
        organization_id: parseInt(formData.organizationId),
      };

      // Include subdomain if provided
      if (formData.subdomain && formData.subdomain.trim()) {
        requestBody.subdomain = formData.subdomain.trim().toLowerCase();
      }

      const response = await fetch('http://127.0.0.1:8000/api/superadmin/users/create_state_admin/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('pulseofpeople_access_token')}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.message || 'Failed to create state admin');
      }

      const result = await response.json();

      // Reset form and close modal
      setFormData({
        name: '',
        email: '',
        username: '',
        phone: '',
        password: '',
        confirmPassword: '',
        organizationName: '',
        stateId: '',
        organizationId: '',
        subdomain: '',
      });
      setSubdomainStatus({
        checking: false,
        available: null,
        message: '',
        preview: '',
      });
      setShowCreateModal(false);
      await loadAdmins();

      alert(`State Admin created successfully!\n\nName: ${result.user.name}\nState: ${result.user.state}\nOrganization: ${result.user.organization}\n\nLogin credentials have been sent to ${result.user.email}`);
    } catch (error: any) {
      console.error('Failed to create state admin:', error);
      setCreateError(error.message || 'Failed to create state admin. Please try again.');
    } finally {
      setCreating(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admins...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 -mx-8 -mt-6 mb-8">
        <div className="px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <PeopleIcon className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Management</h1>
                <p className="text-sm text-gray-500">Manage client organization admins</p>
              </div>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <AddIcon className="w-5 h-5 mr-2" />
              Create State Admin
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div>
        {/* Filters */}
        <div className="bg-white rounded-lg shadow mb-6 p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name, email, or organization..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-4 py-2 rounded-lg ${
                  filterStatus === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All ({admins.length})
              </button>
              <button
                onClick={() => setFilterStatus('active')}
                className={`px-4 py-2 rounded-lg ${
                  filterStatus === 'active'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Active ({admins.filter((a) => a.status === 'active').length})
              </button>
              <button
                onClick={() => setFilterStatus('inactive')}
                className={`px-4 py-2 rounded-lg ${
                  filterStatus === 'inactive'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Inactive ({admins.filter((a) => a.status === 'inactive').length})
              </button>
            </div>
          </div>
        </div>

        {/* Admins List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Admin
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Organization
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tenants
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAdmins.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      No admins found
                    </td>
                  </tr>
                ) : (
                  filteredAdmins.map((admin) => (
                    <tr key={admin.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <PeopleIcon className="w-6 h-6 text-blue-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{admin.name}</div>
                            <div className="text-sm text-gray-500 flex items-center">
                              <EmailIcon className="w-4 h-4 mr-1" />
                              {admin.email}
                            </div>
                            {admin.phone && (
                              <div className="text-sm text-gray-500 flex items-center">
                                <PhoneIcon className="w-4 h-4 mr-1" />
                                {admin.phone}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {admin.organizationName ? (
                          <div>
                            <div className="flex items-center text-sm text-gray-900">
                              <BusinessIcon className="w-4 h-4 mr-2 text-purple-600" />
                              {admin.organizationName}
                            </div>
                            {admin.stateName && (
                              <div className="text-xs text-gray-500 ml-6">
                                State: {admin.stateName}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">No organization</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {admin.totalTenants} total
                        </div>
                        <div className="text-sm text-gray-500">
                          {admin.activeTenants} active
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
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
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(admin.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          {/* View Button */}
                          <button
                            onClick={() => navigate(`/super-admin/admins/${admin.id}/view`)}
                            className="inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                            title="View Details"
                          >
                            <ViewIcon className="w-4 h-4 mr-1" />
                            <span className="text-sm font-medium">View</span>
                          </button>

                          {/* Edit Button */}
                          <button
                            onClick={() => navigate(`/super-admin/admins/${admin.id}/edit`)}
                            className="inline-flex items-center px-3 py-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                            title="Edit Details"
                          >
                            <EditIcon className="w-4 h-4 mr-1" />
                            <span className="text-sm font-medium">Edit</span>
                          </button>

                          {/* More Actions Menu */}
                          <div className="relative inline-block">
                            <button
                              onClick={() =>
                                setShowActionsMenu(showActionsMenu === admin.id ? null : admin.id)
                              }
                              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                              title="More Actions"
                            >
                              <MoreIcon className="w-5 h-5" />
                            </button>

                            {showActionsMenu === admin.id && (
                              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                                <div className="py-1">
                                  {admin.status === 'active' ? (
                                    <button
                                      onClick={() => handleSuspendAdmin(admin)}
                                      className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                                    >
                                      <BlockIcon className="w-4 h-4 mr-2" />
                                      Suspend Admin
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => handleActivateAdmin(admin)}
                                      className="flex items-center w-full px-4 py-2 text-sm text-green-700 hover:bg-green-50"
                                    >
                                      <ActiveIcon className="w-4 h-4 mr-2" />
                                      Activate Admin
                                    </button>
                                  )}
                                  <button
                                    onClick={() => handleDeleteAdmin(admin)}
                                    className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                                  >
                                    <DeleteIcon className="w-4 h-4 mr-2" />
                                    Delete Admin
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Create Admin Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Create State Admin</h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setCreateError('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <CloseIcon className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleCreateAdmin} className="p-6 space-y-4">
              {createError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {createError}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Username *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="johndoe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+91 9876543210"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Min. 8 characters"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Re-enter password"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Organization *
                  </label>
                  <select
                    required
                    value={formData.organizationId}
                    onChange={(e) => setFormData({ ...formData, organizationId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Organization</option>
                    {organizations.map((org) => (
                      <option key={org.id} value={org.id}>
                        {org.name}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-sm text-gray-500">
                    Political party or organization
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State *
                  </label>
                  <select
                    required
                    value={formData.stateId}
                    onChange={(e) => setFormData({ ...formData, stateId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select State</option>
                    {states.map((state) => (
                      <option key={state.id} value={state.id}>
                        {state.name} ({state.code})
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-sm text-gray-500">
                    State to manage
                  </p>
                </div>
              </div>

              {/* Subdomain Section */}
              <div className="border-t border-gray-200 pt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Organization Subdomain (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.subdomain}
                    onChange={(e) => {
                      const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
                      setFormData({ ...formData, subdomain: value });
                    }}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      subdomainStatus.available === true
                        ? 'border-green-300 bg-green-50'
                        : subdomainStatus.available === false
                        ? 'border-red-300 bg-red-50'
                        : 'border-gray-300'
                    }`}
                    placeholder="tvk (will create tvk.pulseofpeople.com)"
                  />

                  {/* Subdomain Status Messages */}
                  {formData.subdomain && (
                    <div className="mt-2 space-y-1">
                      {subdomainStatus.checking && (
                        <p className="text-sm text-gray-600">
                          <span className="inline-block animate-spin mr-1">⟳</span>
                          {subdomainStatus.message}
                        </p>
                      )}

                      {!subdomainStatus.checking && subdomainStatus.message && (
                        <p className={`text-sm ${
                          subdomainStatus.available ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {subdomainStatus.message}
                        </p>
                      )}

                      {subdomainStatus.preview && subdomainStatus.available && (
                        <p className="text-sm text-gray-600">
                          Preview: <span className="font-mono font-semibold text-blue-600">{subdomainStatus.preview}</span>
                        </p>
                      )}
                    </div>
                  )}

                  <p className="mt-2 text-sm text-gray-500">
                    Custom subdomain for organization landing page (e.g., "tvk" creates tvk.pulseofpeople.com). Leave empty to skip.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setCreateError('');
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creating ? 'Creating...' : 'Create Admin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminManagement;
