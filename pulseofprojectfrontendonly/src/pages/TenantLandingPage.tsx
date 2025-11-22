/**
 * Tenant Landing Page Wrapper
 * Uses the dynamic TenantLandingPage component that reads all config from tenant context
 */
import React from 'react';
import DynamicTenantLandingPage from '../components/TenantLandingPage';

export default function TenantLandingPage() {
  return <DynamicTenantLandingPage showHeader={true} showFooter={true} />;
}