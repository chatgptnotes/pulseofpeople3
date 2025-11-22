/**
 * Tenant Identification System
 * Identifies which tenant the current user belongs to based on:
 * - Subdomain (kerala.pulseofpeople.com)
 * - Custom domain (election.kerala.gov.in)
 * - Path (/kerala/dashboard)
 * - Header (X-Tenant-ID)
 */

import { TenantIdentification } from './types';

// Reserved subdomains that should not be treated as tenants
const RESERVED_SUBDOMAINS = [
  'www', 'app', 'api', 'admin', 'superadmin',
  'test', 'staging', 'dev',  // Removed 'demo' - it's a valid tenant!
  'cdn', 'static', 'assets', 'media', 'storage',
  'mail', 'smtp', 'ftp', 'docs', 'help'
];

/**
 * Extract tenant slug from subdomain
 * Examples:
 *   - bjp.localhost:5173 → bjp
 *   - tvk.localhost:5173 → tvk
 *   - kerala.pulseofpeople.com → kerala
 *   - tamilnadu.pulseofpeople.com → tamilnadu
 *   - www.pulseofpeople.com → null (main app)
 *   - localhost:5173 → null (no tenant)
 */
export function extractTenantFromSubdomain(hostname: string): string | null {
  // Remove port number if present (e.g., localhost:5173 → localhost)
  const hostnameWithoutPort = hostname.split(':')[0];

  // Parse hostname parts
  const parts = hostnameWithoutPort.split('.');

  // Log for debugging (remove in production)
  if (import.meta.env.DEV) {
    console.log('[Tenant Detection] Hostname:', hostname, '| Parts:', parts);
  }

  // Development/localhost - Pattern: bjp.localhost, tvk.localhost
  if (hostnameWithoutPort.includes('localhost') || hostnameWithoutPort.includes('127.0.0.1') || hostnameWithoutPort.includes('.local')) {
    // Check for pattern: bjp.localhost (2 parts)
    if (parts.length >= 2 && parts[0] !== 'localhost' && parts[0] !== '127') {
      const subdomain = parts[0];

      // Skip if reserved subdomain
      if (RESERVED_SUBDOMAINS.includes(subdomain.toLowerCase())) {
        if (import.meta.env.DEV) {
          console.log('[Tenant Detection] Reserved subdomain, skipping:', subdomain);
        }
        return null;
      }

      if (import.meta.env.DEV) {
        console.log('[Tenant Detection] Found tenant from localhost:', subdomain);
      }
      return subdomain;
    }

    // Just "localhost" - no tenant
    if (import.meta.env.DEV) {
      console.log('[Tenant Detection] Plain localhost, no tenant');
    }
    return null;
  }

  // Production pattern: kerala.pulseofpeople.com (3+ parts)
  if (parts.length >= 3) {
    const subdomain = parts[0];

    // Skip if reserved subdomain
    if (RESERVED_SUBDOMAINS.includes(subdomain.toLowerCase())) {
      if (import.meta.env.DEV) {
        console.log('[Tenant Detection] Reserved subdomain in production, skipping:', subdomain);
      }
      return null;
    }

    if (import.meta.env.DEV) {
      console.log('[Tenant Detection] Found tenant from production domain:', subdomain);
    }
    return subdomain;
  }

  // No tenant identified
  if (import.meta.env.DEV) {
    console.log('[Tenant Detection] No tenant identified from hostname:', hostname);
  }
  return null;
}

/**
 * Extract tenant from URL path
 * Examples:
 *   - /kerala/dashboard → kerala
 *   - /tamilnadu/analytics → tamilnadu
 */
export function extractTenantFromPath(pathname: string): string | null {
  const parts = pathname.split('/').filter(Boolean);

  if (parts.length > 0) {
    const potentialTenant = parts[0];

    // Check if it looks like a tenant slug (lowercase, hyphens)
    if (/^[a-z0-9-]+$/.test(potentialTenant)) {
      return potentialTenant;
    }
  }

  return null;
}

/**
 * Extract tenant from custom header
 * Used for API calls and mobile apps
 */
export function extractTenantFromHeader(headers: Headers | Record<string, string>): string | null {
  if (headers instanceof Headers) {
    return headers.get('x-tenant-id') || headers.get('X-Tenant-ID');
  }
  return headers['x-tenant-id'] || headers['X-Tenant-ID'] || null;
}

/**
 * Extract tenant from JWT token
 */
export function extractTenantFromToken(token: string): string | null {
  try {
    // Decode JWT (basic parsing, you should use a library in production)
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const payload = JSON.parse(atob(parts[1]));
    return payload.tenantId || payload.tenant_id || null;
  } catch (error) {
    console.error('Failed to parse token:', error);
    return null;
  }
}

/**
 * Primary tenant identification function
 * Tries multiple methods in order of priority
 */
export function identifyTenant(): TenantIdentification | null {
  const hostname = window.location.hostname;
  const pathname = window.location.pathname;
  const isProduction = !hostname.includes('localhost') && !hostname.includes('127.0.0.1');

  // In production, prioritize path over subdomain (for Vercel compatibility)
  // In development, prioritize subdomain (for local testing)

  if (isProduction) {
    // Production priority: path → subdomain → localStorage

    // 1. Try path first (for URLs like: pulseofpeople3.vercel.app/bjp)
    const tenantFromPath = extractTenantFromPath(pathname);
    if (tenantFromPath) {
      if (import.meta.env.DEV) {
        console.log('[Tenant Detection] Found tenant from path (production):', tenantFromPath);
      }
      return {
        method: 'path',
        value: pathname,
        tenantId: tenantFromPath,
        tenantSlug: tenantFromPath
      };
    }

    // 2. Try subdomain (for custom domains like: bjp.pulseofpeople.com)
    const tenantFromSubdomain = extractTenantFromSubdomain(hostname);
    if (tenantFromSubdomain) {
      return {
        method: 'subdomain',
        value: hostname,
        tenantId: tenantFromSubdomain,
        tenantSlug: tenantFromSubdomain
      };
    }
  } else {
    // Development priority: subdomain → path → localStorage

    // 1. Try subdomain first (for URLs like: bjp.localhost:5173)
    const tenantFromSubdomain = extractTenantFromSubdomain(hostname);
    if (tenantFromSubdomain) {
      return {
        method: 'subdomain',
        value: hostname,
        tenantId: tenantFromSubdomain,
        tenantSlug: tenantFromSubdomain
      };
    }

    // 2. Try path
    const tenantFromPath = extractTenantFromPath(pathname);
    if (tenantFromPath) {
      if (import.meta.env.DEV) {
        console.log('[Tenant Detection] Found tenant from path (development):', tenantFromPath);
      }
      return {
        method: 'path',
        value: pathname,
        tenantId: tenantFromPath,
        tenantSlug: tenantFromPath
      };
    }
  }

  // 3. Try localStorage (fallback for both)
  const storedTenant = localStorage.getItem('tenantId');
  if (storedTenant) {
    return {
      method: 'token',
      value: storedTenant,
      tenantId: storedTenant,
      tenantSlug: storedTenant
    };
  }

  // 4. No tenant identified
  if (import.meta.env.DEV) {
    console.log('[Tenant Detection] No tenant identified');
  }
  return null;
}

/**
 * Get tenant ID or throw error
 */
export function requireTenant(): string {
  const identification = identifyTenant();

  if (!identification) {
    throw new Error('No tenant identified. Please access via a tenant-specific URL.');
  }

  return identification.tenantId;
}

/**
 * Check if current context is tenant-specific
 */
export function isTenantContext(): boolean {
  return identifyTenant() !== null;
}

/**
 * Get tenant-aware URL
 * Converts /dashboard to /kerala/dashboard or kerala.pulseofpeople.com/dashboard
 */
export function getTenantUrl(path: string, tenantSlug?: string): string {
  const tenant = tenantSlug || requireTenant();
  const identification = identifyTenant();

  if (!identification) {
    throw new Error('No tenant context');
  }

  // If using subdomain, just return the path
  if (identification.method === 'subdomain') {
    return path;
  }

  // If using path-based routing, prepend tenant
  if (identification.method === 'path') {
    return `/${tenant}${path}`;
  }

  return path;
}

/**
 * Validate tenant slug format
 */
export function isValidTenantSlug(slug: string): boolean {
  // Lowercase letters, numbers, hyphens only
  // Must start with letter
  // 3-50 characters
  return /^[a-z][a-z0-9-]{2,49}$/.test(slug);
}

/**
 * Generate tenant slug from name
 */
export function generateTenantSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
    .replace(/\s+/g, '-')          // Replace spaces with hyphens
    .replace(/-+/g, '-')           // Remove duplicate hyphens
    .substring(0, 50);              // Max 50 chars
}

/**
 * Store tenant in session (for development/testing)
 */
export function setTenantForSession(tenantSlug: string): void {
  localStorage.setItem('tenantId', tenantSlug);
  sessionStorage.setItem('tenantId', tenantSlug);
}

/**
 * Clear tenant from session
 */
export function clearTenantSession(): void {
  localStorage.removeItem('tenantId');
  sessionStorage.removeItem('tenantId');
}

/**
 * Check if running in multi-tenant mode
 */
export function isMultiTenantMode(): boolean {
  return import.meta.env.VITE_MULTI_TENANT === 'true';
}

/**
 * Get tenant registry URL
 */
export function getTenantRegistryUrl(): string {
  return import.meta.env.VITE_TENANT_REGISTRY_URL || 'https://registry.pulseofpeople.com';
}
