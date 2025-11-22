import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowBack as BackIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';

interface AdminFormData {
  name: string;
  email: string;
  phone: string;
  username: string;
  organizationId: string;
  stateId: string;
  status: string;
}

export function AdminEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<AdminFormData>({
    name: '',
    email: '',
    phone: '',
    username: '',
    organizationId: '',
    stateId: '',
    status: 'active',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [states, setStates] = useState<{id: number, name: string, code: string}[]>([]);
  const [organizations, setOrganizations] = useState<{id: number, name: string}[]>([]);

  useEffect(() => {
    loadAdminDetails();
    loadStatesAndOrganizations();
  }, [id]);

  async function loadStatesAndOrganizations() {
    try {
      const token = localStorage.getItem('pulseofpeople_access_token');

      // Fetch states
      const statesResponse = await fetch('http://127.0.0.1:8000/api/superadmin/users/states/', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (statesResponse.ok) {
        const statesData = await statesResponse.json();
        setStates(statesData.states || []);
      }

      // Fetch organizations
      const orgsResponse = await fetch('http://127.0.0.1:8000/api/superadmin/tenants/', {
        headers: {
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

  async function loadAdminDetails() {
    try {
      setLoading(true);
      const token = localStorage.getItem('pulseofpeople_access_token');

      const response = await fetch(`http://127.0.0.1:8000/api/superadmin/users/${id}/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load admin details');
      }

      const data = await response.json();

      console.log('Backend API response:', data); // Debug log

      // Populate form with existing data
      // Backend returns nested profile data under data.profile
      const fullName = (data.first_name || data.last_name)
        ? `${data.first_name || ''} ${data.last_name || ''}`.trim()
        : data.name || '';

      setFormData({
        name: fullName,
        email: data.email || '',
        phone: data.profile?.phone || '',  // Nested under profile
        username: data.username || '',
        organizationId: (data.profile?.organization || data.profile?.organization_id)?.toString() || '',  // Nested under profile
        stateId: data.profile?.assigned_state?.toString() || '',  // Nested under profile
        status: data.is_active === false ? 'inactive' : 'active',
      });
    } catch (err: any) {
      console.error('Failed to load admin:', err);
      setError(err.message || 'Failed to load admin details');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      const token = localStorage.getItem('pulseofpeople_access_token');

      // Split name into first and last name
      const nameParts = formData.name.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      const response = await fetch(`http://127.0.0.1:8000/api/superadmin/users/${id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          first_name: firstName,
          last_name: lastName,
          phone: formData.phone,
          state_id: parseInt(formData.stateId),
          organization_id: parseInt(formData.organizationId),
          status: formData.status,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.message || 'Failed to update admin');
      }

      alert('Admin updated successfully!');
      navigate('/super-admin/admins');
    } catch (err: any) {
      console.error('Failed to update admin:', err);
      setError(err.message || 'Failed to update admin');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 -mx-8 -mt-6 mb-8">
        <div className="px-8 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/super-admin/admins')}
              className="text-gray-400 hover:text-gray-600"
            >
              <BackIcon className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Edit Admin</h1>
              <p className="text-sm text-gray-500">Update state admin information</p>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg shadow">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              />
            </div>

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
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status *
              </label>
              <select
                required
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/super-admin/admins')}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              <CancelIcon className="w-5 h-5 mr-2" />
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <SaveIcon className="w-5 h-5 mr-2" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AdminEdit;
