/**
 * Service to fetch demo credentials from Django backend
 * Returns real test users from the Django database
 */

export interface DemoCredential {
  email: string;
  role: string;
  displayName: string;
  password: string;
  username: string; // Added username field for Django authentication
}

/**
 * Fetch demo users from Django API
 * Returns one user per role for display on login page
 */
export async function fetchDemoCredentials(): Promise<DemoCredential[]> {
  try {
    // For now, return hardcoded credentials that match Django users
    // In future, we can add a Django API endpoint to fetch these dynamically
    return getDjangoTestCredentials();

  } catch (error) {
    console.error('[DemoCredentials] Unexpected error:', error);
    return getDjangoTestCredentials();
  }
}

/**
 * Django test credentials
 * These match the actual users created in Django database
 * Password for all users: bhupendra
 */
function getDjangoTestCredentials(): DemoCredential[] {
  return [
    {
      username: 'superadmin',
      email: 'superadmin@pulseofpeople.com',
      role: 'superadmin',
      displayName: 'Super Admin',
      password: 'bhupendra'
    },
    {
      username: 'admin',
      email: 'admin@pulseofpeople.com',
      role: 'admin',
      displayName: 'Admin User',
      password: 'bhupendra'
    },
    {
      username: 'editor',
      email: 'editor@pulseofpeople.com',
      role: 'editor',
      displayName: 'Editor User',
      password: 'bhupendra'
    },
    {
      username: 'viewer',
      email: 'viewer@pulseofpeople.com',
      role: 'viewer',
      displayName: 'Viewer User',
      password: 'bhupendra'
    }
  ];
}
