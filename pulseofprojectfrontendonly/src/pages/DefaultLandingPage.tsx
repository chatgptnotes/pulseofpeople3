/**
 * Default Landing Page (No Tenant)
 *
 * Shown when user visits plain localhost:5173 without subdomain
 * Generic landing page with links to tenant-specific URLs
 */

import { Box, Container, Typography, Button, Grid, Card, CardContent, Chip } from '@mui/material';
import { Link } from 'react-router-dom';

export default function DefaultLandingPage() {
  const tenants = [
    {
      name: 'BJP',
      slug: 'bjp',
      color: '#FF9933',
      description: 'Bharatiya Janata Party - Sabka Saath, Sabka Vikas',
      url: 'http://bjp.localhost:5173',
      logo: '🪷'
    },
    {
      name: 'Demo',
      slug: 'demo',
      color: '#1976D2',
      description: 'Demo Organization - Sample tenant for testing',
      url: 'http://demo.localhost:5173',
      logo: '⭐'
    }
  ];

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* Header */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: 3,
          boxShadow: 2
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Pulse of People
          </Typography>
          <Typography variant="subtitle1" sx={{ opacity: 0.9, mt: 1 }}>
            Multi-Tenant Political CRM Platform
          </Typography>
        </Container>
      </Box>

      {/* Hero Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 2, color: '#333' }}>
            Welcome to Pulse of People
          </Typography>
          <Typography variant="h6" sx={{ color: '#666', mb: 4, maxWidth: 800, mx: 'auto' }}>
            A comprehensive multi-tenant platform for political parties, campaigns, and organizations
            to manage their operations, analyze voter sentiment, and engage with constituents.
          </Typography>
          <Chip
            label="Multi-Tenant Platform"
            color="primary"
            sx={{ mr: 1, mb: 1 }}
          />
          <Chip
            label="Real-Time Analytics"
            color="secondary"
            sx={{ mr: 1, mb: 1 }}
          />
          <Chip
            label="AI-Powered Insights"
            color="success"
            sx={{ mr: 1, mb: 1 }}
          />
        </Box>

        {/* Tenants Section */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 3, textAlign: 'center', color: '#333' }}>
            Select Your Organization
          </Typography>
          <Typography variant="body1" sx={{ textAlign: 'center', color: '#666', mb: 4 }}>
            Each organization has its own branded portal with custom features and settings
          </Typography>

          <Grid container spacing={3}>
            {tenants.map((tenant) => (
              <Grid item xs={12} md={4} key={tenant.slug}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: 6,
                      borderColor: tenant.color
                    },
                    border: '2px solid',
                    borderColor: 'transparent'
                  }}
                  component="a"
                  href={tenant.url}
                >
                  <CardContent sx={{ flexGrow: 1, textAlign: 'center', p: 4 }}>
                    <Typography variant="h1" sx={{ mb: 2 }}>
                      {tenant.logo}
                    </Typography>
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 700,
                        mb: 2,
                        color: tenant.color
                      }}
                    >
                      {tenant.name}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#666', mb: 3 }}>
                      {tenant.description}
                    </Typography>
                    <Button
                      variant="contained"
                      fullWidth
                      sx={{
                        backgroundColor: tenant.color,
                        '&:hover': {
                          backgroundColor: tenant.color,
                          filter: 'brightness(0.9)'
                        }
                      }}
                    >
                      Visit Portal
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Features Section */}
        <Box sx={{ mb: 6, p: 4, backgroundColor: 'white', borderRadius: 2, boxShadow: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 3, textAlign: 'center' }}>
            Platform Features
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ mb: 1 }}>📊</Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  Real-Time Analytics
                </Typography>
                <Typography variant="body2" sx={{ color: '#666' }}>
                  Live dashboards with sentiment analysis and voter insights
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ mb: 1 }}>🗺️</Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  Geographic Mapping
                </Typography>
                <Typography variant="body2" sx={{ color: '#666' }}>
                  Interactive maps with constituency-level data visualization
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ mb: 1 }}>👥</Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  Voter Management
                </Typography>
                <Typography variant="body2" sx={{ color: '#666' }}>
                  Comprehensive voter database with segmentation
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ mb: 1 }}>🤖</Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  AI-Powered Insights
                </Typography>
                <Typography variant="body2" sx={{ color: '#666' }}>
                  Smart recommendations and predictive analytics
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* CTA Section */}
        <Box sx={{ textAlign: 'center', p: 4, backgroundColor: 'white', borderRadius: 2, boxShadow: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
            Need Your Own Tenant?
          </Typography>
          <Typography variant="body1" sx={{ color: '#666', mb: 3 }}>
            Contact us to set up a custom portal for your organization with personalized branding and features.
          </Typography>
          <Button
            component={Link}
            to="/login"
            variant="contained"
            size="large"
            sx={{
              px: 4,
              py: 1.5,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)'
              }
            }}
          >
            Login to Platform
          </Button>
        </Box>
      </Container>

      {/* Footer */}
      <Box
        sx={{
          backgroundColor: '#333',
          color: 'white',
          py: 3,
          mt: 8
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Pulse of People - Multi-Tenant Political CRM Platform
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.6 }}>
                v2.2 - 2025-11-21
              </Typography>
            </Grid>
            <Grid item xs={12} md={6} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Contact: support@pulseofpeople.com
              </Typography>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
}
