/**
 * Tenant Configuration Loader
 * Fetches and caches tenant configuration from local Supabase database
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { TenantConfig } from './types';

// Cache for tenant configurations
const tenantConfigCache = new Map<string, TenantConfig>();
const cacheExpiry = new Map<string, number>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Get Supabase client with hardcoded fallback
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://eepwbydlfecosaqdysho.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVlcHdieWRsZmVjb3NhcWR5c2hvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4NDA3ODQsImV4cCI6MjA3ODQxNjc4NH0.Z83AOOAFPGK-xKio6fYTXwAUJEHdIlsdCxPleDtE53c';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Fetch tenant configuration from Django API
 */
export async function fetchTenantConfig(tenantSlug: string): Promise<TenantConfig | null> {
  // Check cache first
  if (tenantConfigCache.has(tenantSlug)) {
    const expiry = cacheExpiry.get(tenantSlug);
    if (expiry && expiry > Date.now()) {
      return tenantConfigCache.get(tenantSlug)!;
    }
  }

  try {
    // Fetch from Django API
    const djangoApiUrl = import.meta.env.VITE_DJANGO_API_URL || 'http://127.0.0.1:8000/api';
    const url = `${djangoApiUrl}/superadmin/tenants/by-subdomain/${tenantSlug}/`;

    console.log(`[TenantConfig] Fetching tenant from Django: ${url}`);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`Tenant '${tenantSlug}' not found`);
      }
      throw new Error(`Failed to fetch tenant config: ${response.statusText}`);
    }

    const result = await response.json();

    if (!result.success || !result.tenant) {
      throw new Error(`Tenant '${tenantSlug}' not found`);
    }

    const data = result.tenant;

    // Transform Django API response to TenantConfig format
    const config: TenantConfig = {
      id: data.id.toString(),
      slug: data.slug,
      name: data.name,
      displayName: data.name,
      subdomain: data.subdomain,
      customDomain: data.custom_domain,
      status: data.is_active ? 'active' : 'inactive',
      subscriptionStatus: data.subscription_status || 'active',
      subscriptionTier: data.subscription_tier || 'standard',
      branding: data.branding || {},
      landingPageConfig: data.landing_page_config || {},
      features: data.features_enabled || {},
      config: data.settings || {},
      metadata: {
        party_name: data.party_name,
        party_symbol: data.party_symbol,
        party_color: data.party_color,
      },
      supabaseUrl: supabaseUrl,
      supabaseAnonKey: supabaseAnonKey,
    };

    console.log('[TenantConfig] Tenant loaded successfully:', config.name);

    // Cache the configuration
    tenantConfigCache.set(tenantSlug, config);
    cacheExpiry.set(tenantSlug, Date.now() + CACHE_DURATION);

    return config;
  } catch (error) {
    console.error('[TenantConfig] Failed to fetch tenant config:', error);
    throw error;
  }
}

/**
 * Load tenant configuration
 * This is the main function to use
 */
export async function loadTenantConfig(tenantSlug: string): Promise<TenantConfig> {
  try {
    const config = await fetchTenantConfig(tenantSlug);

    if (!config) {
      throw new Error(`Tenant configuration not found for: ${tenantSlug}`);
    }

    return config;
  } catch (error) {
    // Fallback to mock tenant configuration if API fails
    console.warn(`[TenantConfig] API failed, falling back to mock config for: ${tenantSlug}`);
    console.error('[TenantConfig] Error:', error);

    const mockConfig = getMockTenantConfig(tenantSlug);
    if (mockConfig) {
      console.log(`[TenantConfig] Using mock configuration for: ${tenantSlug}`);
      return mockConfig;
    }

    // If no mock config exists, throw error
    throw new Error(`Tenant configuration not found for: ${tenantSlug}`);
  }
}

/**
 * Clear tenant config cache
 */
export function clearTenantCache(tenantSlug?: string): void {
  if (tenantSlug) {
    tenantConfigCache.delete(tenantSlug);
    cacheExpiry.delete(tenantSlug);
  } else {
    tenantConfigCache.clear();
    cacheExpiry.clear();
  }
}

/**
 * Preload tenant configurations (for frequently accessed tenants)
 */
export async function preloadTenantConfigs(tenantSlugs: string[]): Promise<void> {
  await Promise.all(tenantSlugs.map(slug => fetchTenantConfig(slug)));
}

/**
 * Get mock tenant configuration for development/fallback
 */
function getMockTenantConfig(tenantSlug: string): TenantConfig | null {
  const configs: Record<string, TenantConfig> = {
    // BJP - Bharatiya Janata Party
    'bjp': {
      id: 'mock-bjp',
      slug: 'bjp',
      name: 'BJP Delhi',
      displayName: 'BJP Delhi',
      subdomain: 'bjp',
      customDomain: null,
      status: 'active',
      subscriptionStatus: 'active',
      subscriptionTier: 'premium',
      branding: {
        primaryColor: '#FF9933',
        secondaryColor: '#138808',
        logo: '/assets/images/bjp-logo.png',
        theme: 'saffron',
        heroTitle: 'BJP Delhi - Win Elections with Data-Driven Intelligence',
        motto: 'Sabka Saath, Sabka Vikas, Sabka Vishwas, Sabka Prayas'
      },
      landingPageConfig: {
        heroTitle: 'BJP Delhi',
        heroSubtitle: 'Win Elections with Data-Driven Intelligence',
        heroDescription: 'Pulse of People combines real-time voter sentiment analysis, AI-powered campaign insights, and comprehensive political intelligence to help you make informed decisions and win elections.',
        features: [
          { title: 'SOC 2 Type 2 Certified', icon: 'verified_user' },
          { title: '99.9% Uptime', icon: 'cloud_done' },
          { title: '24/7 Support', icon: 'support_agent' },
          { title: '500+ Campaigns', icon: 'campaign' }
        ]
      },
      features: {
        analytics: true,
        surveys: true,
        fieldReports: true,
        socialMedia: true,
        volunteerManagement: true,
        boothManagement: true,
        digitalCampaigning: true
      },
      config: {
        state: 'Delhi',
        districts: ['North Delhi', 'South Delhi', 'East Delhi', 'West Delhi', 'Central Delhi', 'New Delhi', 'North East Delhi'],
        partySymbol: 'lotus',
        electionYear: '2025'
      },
      metadata: {
        party_name: 'Bharatiya Janata Party',
        party_symbol: 'lotus',
        party_color: '#FF9933'
      },
      supabaseUrl: supabaseUrl,
      supabaseAnonKey: supabaseAnonKey
    },

    // TVK - Tamilaga Vettri Kazhagam
    'tvk': {
      id: 'mock-tvk',
      slug: 'tvk',
      name: 'TVK Tamil Nadu',
      displayName: 'TVK - Tamilaga Vettri Kazhagam',
      subdomain: 'tvk',
      customDomain: null,
      status: 'active',
      subscriptionStatus: 'active',
      subscriptionTier: 'premium',
      branding: {
        primaryColor: '#dc2626',
        secondaryColor: '#fbbf24',
        logo: '/assets/images/tvk-logo.png',
        theme: 'red-yellow',
        heroTitle: 'TVK - Building Progressive Tamil Nadu',
        motto: 'Pirappokkum Ella Uyirkkum - All Lives are Equal by Birth'
      },
      landingPageConfig: {
        heroTitle: 'TVK Tamil Nadu',
        heroSubtitle: 'Building Progressive Tamil Nadu',
        heroDescription: 'Pulse of People combines real-time voter sentiment analysis, AI-powered campaign insights, and comprehensive political intelligence to help you make informed decisions and win elections.',
        features: [
          { title: 'SOC 2 Type 2 Certified', icon: 'verified_user' },
          { title: '99.9% Uptime', icon: 'cloud_done' },
          { title: '24/7 Support', icon: 'support_agent' },
          { title: '500+ Campaigns', icon: 'campaign' }
        ]
      },
      features: {
        analytics: true,
        surveys: true,
        fieldReports: true,
        socialMedia: true,
        volunteerManagement: true,
        boothManagement: true,
        digitalCampaigning: true
      },
      config: {
        state: 'Tamil Nadu',
        districts: ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tirunelveli', 'Erode', 'Vellore', 'Thoothukudi', 'Thanjavur'],
        partySymbol: 'rising-sun',
        electionYear: '2026'
      },
      metadata: {
        party_name: 'Tamilaga Vettri Kazhagam',
        party_symbol: 'rising-sun',
        party_color: '#dc2626'
      },
      supabaseUrl: supabaseUrl,
      supabaseAnonKey: supabaseAnonKey
    },

    // Congress - Indian National Congress
    'congress': {
      id: 'mock-congress',
      slug: 'congress',
      name: 'Congress Karnataka',
      displayName: 'Indian National Congress - Karnataka',
      subdomain: 'congress',
      customDomain: null,
      status: 'active',
      subscriptionStatus: 'active',
      subscriptionTier: 'premium',
      branding: {
        primaryColor: '#0066CC',
        secondaryColor: '#FFFFFF',
        logo: '/assets/images/congress-logo.png',
        theme: 'blue-white',
        heroTitle: 'Congress Karnataka - Together We Can',
        motto: 'Jai Hind'
      },
      landingPageConfig: {
        heroTitle: 'Congress Karnataka',
        heroSubtitle: 'Win Elections with Data-Driven Intelligence',
        heroDescription: 'Pulse of People combines real-time voter sentiment analysis, AI-powered campaign insights, and comprehensive political intelligence to help you make informed decisions and win elections.',
        features: [
          { title: 'SOC 2 Type 2 Certified', icon: 'verified_user' },
          { title: '99.9% Uptime', icon: 'cloud_done' },
          { title: '24/7 Support', icon: 'support_agent' },
          { title: '500+ Campaigns', icon: 'campaign' }
        ]
      },
      features: {
        analytics: true,
        surveys: true,
        fieldReports: true,
        socialMedia: true,
        volunteerManagement: true,
        boothManagement: true,
        digitalCampaigning: true
      },
      config: {
        state: 'Karnataka',
        districts: ['Bengaluru', 'Mysuru', 'Mangaluru', 'Hubli', 'Belagavi', 'Kalaburagi', 'Ballari', 'Vijayapura', 'Davanagere', 'Shivamogga'],
        partySymbol: 'hand',
        electionYear: '2028'
      },
      metadata: {
        party_name: 'Indian National Congress',
        party_symbol: 'hand',
        party_color: '#0066CC'
      },
      supabaseUrl: supabaseUrl,
      supabaseAnonKey: supabaseAnonKey
    },

    // Legacy party-a and party-b for backward compatibility
    'party-a': {
      id: 'mock-party-a',
      slug: 'tvk-tamil-nadu',
      name: 'TVK Tamil Nadu Campaign 2026',
      displayName: 'TVK - Tamilaga Vettri Kazhagam',
      subdomain: 'party-a',
      customDomain: null,
      status: 'active',
      subscriptionStatus: 'active',
      subscriptionTier: 'premium',
      branding: {
        primaryColor: '#dc2626',
        secondaryColor: '#fbbf24',
        logo: '/assets/images/tvk-logo.png',
        theme: 'red-yellow',
        heroTitle: 'TVK - Building Progressive Tamil Nadu',
        motto: 'Pirappokkum Ella Uyirkkum - All Lives are Equal by Birth'
      },
      landingPageConfig: {},
      features: {
        analytics: true,
        surveys: true,
        fieldReports: true,
        socialMedia: true,
        volunteerManagement: true,
        boothManagement: true,
        digitalCampaigning: true
      },
      config: {
        state: 'Tamil Nadu',
        districts: ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tirunelveli', 'Erode', 'Vellore', 'Thoothukudi', 'Thanjavur'],
        partySymbol: 'rising-sun',
        electionYear: '2026'
      },
      metadata: {
        partyAffiliation: 'TVK',
        regionalParty: true,
        founded: '2024-02-02',
        leader: 'Vijay'
      },
      supabaseUrl: supabaseUrl,
      supabaseAnonKey: supabaseAnonKey
    },
    'party-b': {
      id: 'mock-party-b',
      slug: 'bjp-kerala',
      name: 'BJP Tamil Nadu Campaign 2026',
      displayName: 'BJP Tamil Nadu',
      subdomain: 'party-b',
      customDomain: null,
      status: 'active',
      subscriptionStatus: 'active',
      subscriptionTier: 'premium',
      branding: {
        primaryColor: '#FF9933',
        secondaryColor: '#FF6B00',
        logo: '/assets/images/bjp-logo.png',
        theme: 'saffron',
        heroTitle: 'BJP Tamil Nadu - Building a Stronger Tomorrow',
        motto: 'Sabka Saath, Sabka Vikas, Sabka Vishwas, Sabka Prayas'
      },
      landingPageConfig: {},
      features: {
        analytics: true,
        surveys: true,
        fieldReports: true,
        socialMedia: true,
        boothManagement: true,
        digitalCampaigning: true
      },
      config: {
        state: 'Tamil Nadu',
        districts: ['Thiruvananthapuram', 'Kollam', 'Pathanamthitta', 'Alappuzha', 'Kottayam', 'Idukki', 'Ernakulam', 'Thrissur', 'Palakkad', 'Malappuram', 'Kozhikode', 'Wayanad', 'Kannur', 'Kasaragod'],
        partySymbol: 'lotus',
        electionYear: '2026'
      },
      metadata: {
        partyAffiliation: 'BJP',
        nationalParty: true,
        founded: '1980-04-06'
      },
      supabaseUrl: supabaseUrl,
      supabaseAnonKey: supabaseAnonKey
    }
  };

  return configs[tenantSlug] || null;
}

/**
 * Create Supabase client for tenant (uses shared database)
 */
export function createTenantSupabaseClient(config: TenantConfig): SupabaseClient {
  // Use the shared Supabase instance with tenant context
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }

  // Return the shared client - RLS policies will handle tenant isolation
  return supabase;
}

/**
 * Get Supabase client for current tenant
 */
let currentTenantClient: SupabaseClient | null = null;
let currentTenantSlug: string | null = null;

export async function getTenantSupabaseClient(tenantSlug: string): Promise<SupabaseClient> {
  // In single-database mode, always return the shared client
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }
  return supabase;
}

/**
 * Check if feature is enabled for tenant
 */
export function isFeatureEnabled(config: TenantConfig, feature: string): boolean {
  // Check in features object
  if (config.features && typeof config.features === 'object') {
    return config.features[feature] === true;
  }
  return false;
}

/**
 * Check if tenant has reached usage limits
 */
export interface UsageLimitCheck {
  withinLimit: boolean;
  current: number;
  limit: number;
  percentage: number;
}

export function checkUserLimit(config: TenantConfig, currentUsers: number): UsageLimitCheck {
  const percentage = (currentUsers / config.maxUsers) * 100;
  return {
    withinLimit: currentUsers < config.maxUsers,
    current: currentUsers,
    limit: config.maxUsers,
    percentage,
  };
}

export function checkStorageLimit(config: TenantConfig, currentStorageGb: number): UsageLimitCheck {
  const percentage = (currentStorageGb / config.maxStorageGb) * 100;
  return {
    withinLimit: currentStorageGb < config.maxStorageGb,
    current: currentStorageGb,
    limit: config.maxStorageGb,
    percentage,
  };
}

/**
 * Get tenant branding CSS variables
 */
export function getTenantCSSVariables(config: TenantConfig): Record<string, string> {
  const branding = config.branding || {};

  return {
    // Color variables
    '--tenant-primary-color': branding.primary_color || branding.primaryColor || '#1976D2',
    '--tenant-secondary-color': branding.secondary_color || branding.secondaryColor || '#424242',
    '--tenant-accent-color': branding.accent_color || branding.accentColor || '#FF9800',
    '--tenant-text-color': branding.text_color || branding.textColor || '#212121',
    '--tenant-background-color': branding.background_color || branding.backgroundColor || '#FFFFFF',

    // Component-specific colors
    '--tenant-header-bg-color': branding.header_bg_color || branding.headerBgColor || branding.primary_color || '#1976D2',
    '--tenant-footer-bg-color': branding.footer_bg_color || branding.footerBgColor || branding.secondary_color || '#424242',
    '--tenant-button-bg-color': branding.button_bg_color || branding.buttonBgColor || branding.primary_color || '#1976D2',
    '--tenant-button-hover-color': branding.button_hover_color || branding.buttonHoverColor || '#1565C0',

    // Typography
    '--tenant-font-family': branding.font_family || branding.fontFamily || 'Roboto, sans-serif',

    // Logo sizing
    '--tenant-logo-width': branding.logo_width || branding.logoWidth || '200px',
    '--tenant-logo-height': branding.logo_height || branding.logoHeight || '60px',
  };
}

/**
 * Apply tenant branding to document
 * This function injects CSS variables and updates page metadata
 */
export function applyTenantBranding(config: TenantConfig): void {
  const root = document.documentElement;
  const branding = config.branding || {};
  const cssVars = getTenantCSSVariables(config);

  // Apply all CSS variables to root element
  Object.entries(cssVars).forEach(([key, value]) => {
    if (value) {
      root.style.setProperty(key, value);
    }
  });

  // Update page title
  const displayName = config.displayName || config.name || 'Tenant';
  document.title = `${displayName} - Pulse of People`;

  // Update meta description
  const metaDescription = document.querySelector<HTMLMetaElement>('meta[name="description"]');
  if (metaDescription && branding.meta_description) {
    metaDescription.content = branding.meta_description;
  }

  // Update favicon
  const faviconUrl = branding.favicon_url || branding.logo_url || branding.logo;
  if (faviconUrl) {
    // Update or create favicon link
    let favicon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (!favicon) {
      favicon = document.createElement('link');
      favicon.rel = 'icon';
      document.head.appendChild(favicon);
    }
    favicon.href = faviconUrl;

    // Also update apple-touch-icon if exists
    const appleTouchIcon = document.querySelector<HTMLLinkElement>('link[rel="apple-touch-icon"]');
    if (appleTouchIcon) {
      appleTouchIcon.href = faviconUrl;
    }
  }

  // Apply custom CSS if provided
  if (branding.custom_css) {
    let styleElement = document.querySelector<HTMLStyleElement>('#tenant-custom-css');
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = 'tenant-custom-css';
      document.head.appendChild(styleElement);
    }
    styleElement.textContent = branding.custom_css;
  }

  // Log branding application in development
  if (import.meta.env.DEV) {
    console.log('[Tenant Branding] Applied branding for:', displayName);
    console.log('[Tenant Branding] CSS Variables:', cssVars);
  }
}

/**
 * Validate tenant subscription
 */
export interface SubscriptionValidation {
  isValid: boolean;
  status: string;
  daysRemaining?: number;
  message?: string;
}

export function validateSubscription(config: TenantConfig): SubscriptionValidation {
  const now = new Date();

  // Check if trial
  if (config.subscriptionStatus === 'trial') {
    if (config.trialEndDate) {
      const trialEnd = new Date(config.trialEndDate);
      const daysRemaining = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      if (daysRemaining <= 0) {
        return {
          isValid: false,
          status: 'trial_expired',
          daysRemaining: 0,
          message: 'Your trial has expired. Please upgrade to continue.',
        };
      }

      return {
        isValid: true,
        status: 'trial_active',
        daysRemaining,
        message: daysRemaining <= 3 ? `Trial ending in ${daysRemaining} days` : undefined,
      };
    }
  }

  // Check if active subscription
  if (config.subscriptionStatus === 'active') {
    if (config.paymentStatus === 'overdue') {
      return {
        isValid: true, // Still valid but with warning
        status: 'payment_overdue',
        message: 'Payment overdue. Please update your payment method.',
      };
    }

    return {
      isValid: true,
      status: 'active',
    };
  }

  // Suspended or cancelled
  if (config.subscriptionStatus === 'suspended') {
    return {
      isValid: false,
      status: 'suspended',
      message: 'Your subscription has been suspended. Please contact support.',
    };
  }

  if (config.subscriptionStatus === 'expired') {
    return {
      isValid: false,
      status: 'expired',
      message: 'Your subscription has expired. Please renew to continue.',
    };
  }

  return {
    isValid: false,
    status: 'unknown',
    message: 'Unknown subscription status. Please contact support.',
  };
}

/**
 * Get tenant settings value
 */
export function getTenantSetting<T = any>(
  config: TenantConfig,
  key: string,
  defaultValue: T
): T {
  return (config.customSettings[key] as T) ?? defaultValue;
}

/**
 * Export tenant configuration (for debugging)
 */
export function exportTenantConfig(config: TenantConfig): string {
  const sanitized = {
    ...config,
    supabaseAnonKey: '***REDACTED***',
  };
  return JSON.stringify(sanitized, null, 2);
}
