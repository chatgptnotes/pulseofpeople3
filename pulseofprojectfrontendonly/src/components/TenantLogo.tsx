/**
 * TenantLogo Component
 * Dynamically displays logo based on current tenant
 * Falls back to default logo if no tenant or no logo URL
 */
import React from 'react';
import { useTenant } from '../contexts/TenantContext';

interface TenantLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fallbackText?: string;
}

const sizeClasses = {
  sm: 'h-8 w-auto',
  md: 'h-10 w-auto',
  lg: 'h-12 w-auto',
  xl: 'h-16 w-auto',
};

export default function TenantLogo({
  className = '',
  size = 'md',
  fallbackText = 'Pulse of People'
}: TenantLogoProps) {
  const { tenant, isLoading } = useTenant();

  if (isLoading) {
    return (
      <div className={`${sizeClasses[size]} ${className} animate-pulse bg-gray-200 rounded`} />
    );
  }

  // Check if tenant has logo
  const logoUrl = tenant?.branding?.logo_url || tenant?.logo;

  if (logoUrl) {
    return (
      <img
        src={logoUrl}
        alt={tenant?.name || 'Organization Logo'}
        className={`${sizeClasses[size]} ${className} object-contain`}
        onError={(e) => {
          // If image fails to load, hide it and show fallback text
          e.currentTarget.style.display = 'none';
        }}
      />
    );
  }

  // Fallback: Show text logo with tenant colors
  const primaryColor = tenant?.branding?.primary_color || '#1976D2';

  return (
    <div
      className={`${sizeClasses[size]} ${className} flex items-center justify-center font-bold text-white px-4 rounded`}
      style={{ backgroundColor: primaryColor }}
    >
      {tenant?.name?.substring(0, 2).toUpperCase() || fallbackText.substring(0, 2).toUpperCase()}
    </div>
  );
}
