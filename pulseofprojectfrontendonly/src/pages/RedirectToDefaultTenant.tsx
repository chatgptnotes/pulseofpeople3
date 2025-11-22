/**
 * Redirect Page for Plain Localhost Access
 *
 * When user visits plain localhost:5173 without subdomain,
 * automatically redirect to demo.localhost:5173
 */

import { useEffect } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

export default function RedirectToDefaultTenant() {
  useEffect(() => {
    // Redirect to demo subdomain
    const currentPort = window.location.port;
    const redirectUrl = `http://demo.localhost:${currentPort || '5173'}`;

    console.log('[Redirect] Plain localhost detected, redirecting to demo tenant...');
    console.log('[Redirect] Target URL:', redirectUrl);

    // Redirect after 1 second (so user can see the message)
    setTimeout(() => {
      window.location.href = redirectUrl;
    }, 1000);
  }, []);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
        gap: 3
      }}
    >
      <CircularProgress size={60} />
      <Typography variant="h5" sx={{ fontWeight: 500, color: '#666' }}>
        Redirecting to Demo Tenant...
      </Typography>
      <Typography variant="body2" sx={{ color: '#999', maxWidth: 500, textAlign: 'center' }}>
        Please use a subdomain to access the application:
        <br />
        • <strong>bjp.localhost:5173</strong> - BJP Tenant
        <br />
        • <strong>tvk.localhost:5173</strong> - TVK Tenant
        <br />
        • <strong>demo.localhost:5173</strong> - Demo Tenant
      </Typography>
    </Box>
  );
}
