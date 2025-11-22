import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { useEffect } from 'react';

/**
 * RoleBasedDashboard Component
 *
 * Automatically routes users to their role-specific dashboard
 * Based on hierarchical roles:
 * - superadmin → Platform-wide management
 * - state_admin → State-level (all zones in state)
 * - zone_admin → Zone-level (all districts in zone)
 * - district_admin → District-level (all constituencies in district)
 * - constituency_admin → Constituency-level (all booths in constituency)
 * - booth_admin → Booth-level (field workers)
 * - analyst → Read-only observer
 */
export default function RoleBasedDashboard() {
  const { user, isLoading } = useAuth();

  useEffect(() => {
    console.log('RoleBasedDashboard - User:', user?.email, 'Role:', user?.role);
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Route based on user role - Hierarchical Role System
  const roleRoutes: Record<string, string> = {
    // New Hierarchical Roles - Each role has UNIQUE dashboard
    'superadmin': '/superadmin',
    'super_admin': '/superadmin',
    'state_admin': '/dashboard/state',        // State Admin → AdminStateDashboard (State-wide)
    'zone_admin': '/dashboard/zone',          // Zone Admin → ZoneAdminDashboard (Zone-wide)
    'district_admin': '/dashboard/district',  // District Admin → ManagerDistrictDashboard (District-wide)
    'constituency_admin': '/dashboard/constituency', // Constituency Admin → AnalystConstituencyDashboard
    'booth_admin': '/dashboard/booth',        // Booth Admin → UserBoothDashboard
    'analyst': '/dashboard/viewer',           // Analyst → ViewerDashboard (read-only)

    // Legacy Roles (backward compatibility)
    'admin': '/dashboard/admin',
    'manager': '/dashboard/manager',
    'user': '/dashboard/user',
    'volunteer': '/dashboard/volunteer',
    'viewer': '/dashboard/viewer',
  };

  const dashboardRoute = roleRoutes[user.role] || '/dashboard/user';

  console.log('[RoleBasedDashboard] User Role:', user.role, '→ Redirecting to:', dashboardRoute);

  return <Navigate to={dashboardRoute} replace />;
}
