/**
 * Dynamic Tenant Landing Page
 * Fully customizable landing page based on tenant configuration
 * Reads branding, content, features, and styling from tenant config
 */

import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTenant } from '../contexts/TenantContext';
import { TenantConfig } from '../lib/tenant/types';
import Icon from '@mui/material/Icon';
import { Card, CardContent, Typography, Button, Container, Grid, Box, Avatar, Chip } from '@mui/material';
import DefaultLandingPage from '../pages/DefaultLandingPage';

interface LandingPageProps {
  showHeader?: boolean;
  showFooter?: boolean;
}

export default function TenantLandingPage({ showHeader = true, showFooter = true }: LandingPageProps) {
  const { tenant, isLoading } = useTenant();
  const navigate = useNavigate();

  if (isLoading) {
    return <LoadingState />;
  }

  // If no tenant found (plain localhost), show default landing page
  if (!tenant) {
    return <DefaultLandingPage />;
  }

  return (
    <div
      style={{
        backgroundColor: 'var(--tenant-background-color, #FFFFFF)',
        color: 'var(--tenant-text-color, #212121)',
        fontFamily: 'var(--tenant-font-family, Roboto, sans-serif)',
        minHeight: '100vh',
      }}
    >
      {showHeader && <DynamicHeader tenant={tenant} />}
      <HeroSection tenant={tenant} onCTAClick={() => navigate('/register')} />
      <FeaturesSection tenant={tenant} />
      <StatsSection tenant={tenant} />
      <TestimonialsSection tenant={tenant} />
      <AboutSection tenant={tenant} />
      {showFooter && <DynamicFooter tenant={tenant} />}
    </div>
  );
}

/**
 * Loading State
 */
function LoadingState() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            width: '48px',
            height: '48px',
            border: '4px solid #e5e7eb',
            borderTop: '4px solid var(--tenant-primary-color, #1976D2)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px',
          }}
        />
        <Typography variant="h6">Loading...</Typography>
      </div>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

/**
 * Dynamic Header with Logo and Navigation
 */
function DynamicHeader({ tenant }: { tenant: TenantConfig }) {
  const navigate = useNavigate();
  const branding = tenant.branding || {};
  const landingConfig = tenant.landing_page_config || tenant.landingPageConfig || {};

  return (
    <Box
      component="header"
      sx={{
        backgroundColor: 'var(--tenant-header-bg-color)',
        color: '#FFFFFF',
        py: 2,
        px: 3,
        boxShadow: 2,
      }}
    >
      <Container maxWidth="xl">
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Logo Section */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {branding.logo_url && (
              <img
                src={branding.logo_url}
                alt={`${tenant.name} Logo`}
                style={{
                  height: branding.logo_height || '60px',
                  width: 'auto',
                  maxWidth: branding.logo_width || '200px',
                  objectFit: 'contain',
                }}
              />
            )}
            <Box>
              <Typography variant="h5" component="h1" sx={{ fontWeight: 700, color: '#FFF' }}>
                {tenant.displayName || tenant.name}
              </Typography>
              {tenant.party_info?.slogan && (
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                  {tenant.party_info.slogan}
                </Typography>
              )}
            </Box>
          </Box>

          {/* Navigation Buttons */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="text"
              sx={{ color: '#FFF', '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' } }}
              onClick={() => navigate('/login')}
            >
              Login
            </Button>
            <Button
              variant="contained"
              sx={{
                backgroundColor: '#FFF',
                color: 'var(--tenant-header-bg-color)',
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.9)' },
              }}
              onClick={() => navigate('/register')}
            >
              Join Now
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

/**
 * Hero Section
 */
function HeroSection({ tenant, onCTAClick }: { tenant: TenantConfig; onCTAClick: () => void }) {
  const navigate = useNavigate();
  const landingConfig = tenant.landing_page_config || tenant.landingPageConfig || {};
  const partyInfo = tenant.party_info || tenant.partyInfo || {};

  const heroTitle = landingConfig.hero_title || landingConfig.heroTitle || `Welcome to ${tenant.name}`;
  const heroSubtitle =
    landingConfig.hero_subtitle || landingConfig.heroSubtitle || 'Empowering Political Campaigns with Data';
  const heroImage = landingConfig.hero_image || landingConfig.heroImage;
  const heroCTAText = landingConfig.hero_cta_text || landingConfig.heroCtaText || 'Get Started';
  const heroSecondaryCTAText =
    landingConfig.hero_secondary_cta_text || landingConfig.heroSecondaryCtaText || 'Learn More';

  return (
    <Box
      sx={{
        background: heroImage
          ? `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(${heroImage})`
          : `linear-gradient(135deg, var(--tenant-primary-color) 0%, var(--tenant-secondary-color) 100%)`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        color: '#FFFFFF',
        py: { xs: 8, md: 12 },
        px: 3,
        textAlign: 'center',
      }}
    >
      <Container maxWidth="lg">
        <Typography
          variant="h2"
          component="h1"
          sx={{
            fontWeight: 800,
            mb: 3,
            fontSize: { xs: '2rem', md: '3.5rem' },
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
          }}
        >
          {heroTitle}
        </Typography>

        <Typography
          variant="h5"
          sx={{
            mb: 5,
            opacity: 0.95,
            fontSize: { xs: '1.1rem', md: '1.5rem' },
            textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
            maxWidth: '800px',
            mx: 'auto',
          }}
        >
          {heroSubtitle}
        </Typography>

        {partyInfo.slogan && (
          <Typography
            variant="h6"
            sx={{
              mb: 5,
              fontStyle: 'italic',
              opacity: 0.9,
              fontSize: { xs: '0.9rem', md: '1.2rem' },
            }}
          >
            "{partyInfo.slogan}"
          </Typography>
        )}

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            size="large"
            onClick={onCTAClick}
            sx={{
              backgroundColor: '#FFF',
              color: 'var(--tenant-primary-color)',
              px: 4,
              py: 1.5,
              fontSize: '1.1rem',
              fontWeight: 600,
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.9)',
                transform: 'translateY(-2px)',
              },
              transition: 'all 0.3s',
            }}
          >
            {heroCTAText}
          </Button>

          <Button
            variant="outlined"
            size="large"
            onClick={() => navigate('/about')}
            sx={{
              borderColor: '#FFF',
              color: '#FFF',
              px: 4,
              py: 1.5,
              fontSize: '1.1rem',
              '&:hover': {
                borderColor: '#FFF',
                backgroundColor: 'rgba(255,255,255,0.1)',
              },
            }}
          >
            {heroSecondaryCTAText}
          </Button>
        </Box>
      </Container>
    </Box>
  );
}

/**
 * Features Section
 */
function FeaturesSection({ tenant }: { tenant: TenantConfig }) {
  const landingConfig = tenant.landing_page_config || tenant.landingPageConfig || {};
  const features = landingConfig.features || [];

  if (!features.length) return null;

  return (
    <Box sx={{ py: 8, px: 3, backgroundColor: '#F9FAFB' }}>
      <Container maxWidth="lg">
        <Typography variant="h3" component="h2" sx={{ textAlign: 'center', mb: 6, fontWeight: 700 }}>
          Our Focus Areas
        </Typography>

        <Grid container spacing={4}>
          {features.map((feature: any, index: number) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                sx={{
                  height: '100%',
                  textAlign: 'center',
                  transition: 'all 0.3s',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: 6,
                  },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Icon
                    sx={{
                      fontSize: 48,
                      color: 'var(--tenant-primary-color)',
                      mb: 2,
                    }}
                  >
                    {feature.icon || 'star'}
                  </Icon>
                  <Typography variant="h6" component="h3" sx={{ mb: 2, fontWeight: 600 }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}

/**
 * Stats Section
 */
function StatsSection({ tenant }: { tenant: TenantConfig }) {
  const landingConfig = tenant.landing_page_config || tenant.landingPageConfig || {};
  const stats = landingConfig.stats || [];

  if (!stats.length) return null;

  return (
    <Box
      sx={{
        py: 6,
        px: 3,
        background: `linear-gradient(135deg, var(--tenant-primary-color) 0%, var(--tenant-accent-color) 100%)`,
        color: '#FFF',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {stats.map((stat: any, index: number) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Box sx={{ textAlign: 'center' }}>
                {stat.icon && (
                  <Icon sx={{ fontSize: 40, mb: 1, opacity: 0.9 }}>{stat.icon}</Icon>
                )}
                <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>
                  {stat.value}
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.95 }}>
                  {stat.label}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}

/**
 * Testimonials Section
 */
function TestimonialsSection({ tenant }: { tenant: TenantConfig }) {
  const landingConfig = tenant.landing_page_config || tenant.landingPageConfig || {};
  const testimonials = landingConfig.testimonials || [];

  if (!testimonials.length) return null;

  return (
    <Box sx={{ py: 8, px: 3 }}>
      <Container maxWidth="lg">
        <Typography variant="h3" component="h2" sx={{ textAlign: 'center', mb: 6, fontWeight: 700 }}>
          Leadership
        </Typography>

        <Grid container spacing={4} justifyContent="center">
          {testimonials.map((testimonial: any, index: number) => (
            <Grid item xs={12} md={6} key={index}>
              <Card sx={{ p: 3 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Avatar
                      src={testimonial.image}
                      alt={testimonial.name}
                      sx={{ width: 80, height: 80, mr: 2 }}
                    />
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {testimonial.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {testimonial.role}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="body1" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                    "{testimonial.quote}"
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}

/**
 * About Section
 */
function AboutSection({ tenant }: { tenant: TenantConfig }) {
  const landingConfig = tenant.landing_page_config || tenant.landingPageConfig || {};
  const partyInfo = tenant.party_info || tenant.partyInfo || {};

  const aboutSection = landingConfig.about_section || landingConfig.aboutSection;
  const mission = landingConfig.mission_statement || landingConfig.missionStatement;
  const vision = landingConfig.vision_statement || landingConfig.visionStatement;

  if (!aboutSection && !mission && !vision) return null;

  return (
    <Box sx={{ py: 8, px: 3, backgroundColor: '#F9FAFB' }}>
      <Container maxWidth="md">
        <Typography variant="h3" component="h2" sx={{ textAlign: 'center', mb: 6, fontWeight: 700 }}>
          About {tenant.name}
        </Typography>

        {aboutSection && (
          <Typography variant="body1" sx={{ mb: 4, fontSize: '1.1rem', lineHeight: 1.8 }}>
            {aboutSection}
          </Typography>
        )}

        {partyInfo && (
          <Box sx={{ mb: 4 }}>
            <Grid container spacing={2}>
              {partyInfo.party_name && (
                <Grid item xs={12} sm={6}>
                  <Chip label={`Party: ${partyInfo.party_name}`} sx={{ mr: 1, mb: 1 }} />
                </Grid>
              )}
              {partyInfo.party_symbol && (
                <Grid item xs={12} sm={6}>
                  <Chip label={`Symbol: ${partyInfo.party_symbol}`} sx={{ mr: 1, mb: 1 }} />
                </Grid>
              )}
              {partyInfo.founded_date && (
                <Grid item xs={12} sm={6}>
                  <Chip label={`Founded: ${partyInfo.founded_date}`} sx={{ mr: 1, mb: 1 }} />
                </Grid>
              )}
              {partyInfo.leader_name && (
                <Grid item xs={12} sm={6}>
                  <Chip label={`Leader: ${partyInfo.leader_name}`} sx={{ mr: 1, mb: 1 }} />
                </Grid>
              )}
            </Grid>
          </Box>
        )}

        {mission && (
          <Box sx={{ mb: 4, p: 3, backgroundColor: '#FFF', borderRadius: 2, boxShadow: 1 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'var(--tenant-primary-color)' }}>
              Our Mission
            </Typography>
            <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
              {mission}
            </Typography>
          </Box>
        )}

        {vision && (
          <Box sx={{ p: 3, backgroundColor: '#FFF', borderRadius: 2, boxShadow: 1 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'var(--tenant-primary-color)' }}>
              Our Vision
            </Typography>
            <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
              {vision}
            </Typography>
          </Box>
        )}
      </Container>
    </Box>
  );
}

/**
 * Dynamic Footer with Contact and Social Links
 */
function DynamicFooter({ tenant }: { tenant: TenantConfig }) {
  const contactConfig = tenant.contact_config || tenant.contactConfig || {};
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: 'var(--tenant-footer-bg-color)',
        color: '#FFF',
        py: 6,
        px: 3,
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* About Column */}
          <Grid item xs={12} md={4}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              {tenant.name}
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, opacity: 0.9 }}>
              {tenant.landing_page_config?.about_section?.substring(0, 150) || 'Political campaign management platform'}
            </Typography>
          </Grid>

          {/* Contact Column */}
          <Grid item xs={12} md={4}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Contact Us
            </Typography>
            {contactConfig.email && (
              <Typography variant="body2" sx={{ mb: 1, opacity: 0.9 }}>
                Email: {contactConfig.email}
              </Typography>
            )}
            {contactConfig.phone && (
              <Typography variant="body2" sx={{ mb: 1, opacity: 0.9 }}>
                Phone: {contactConfig.phone}
              </Typography>
            )}
            {contactConfig.address && (
              <Typography variant="body2" sx={{ mb: 1, opacity: 0.9 }}>
                {contactConfig.address}
              </Typography>
            )}
          </Grid>

          {/* Social Media Column */}
          <Grid item xs={12} md={4}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Follow Us
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              {contactConfig.facebook && (
                <a href={contactConfig.facebook} target="_blank" rel="noopener noreferrer" style={{ color: '#FFF' }}>
                  <Icon>facebook</Icon>
                </a>
              )}
              {contactConfig.twitter && (
                <a href={contactConfig.twitter} target="_blank" rel="noopener noreferrer" style={{ color: '#FFF' }}>
                  <Icon>twitter</Icon>
                </a>
              )}
              {contactConfig.instagram && (
                <a href={contactConfig.instagram} target="_blank" rel="noopener noreferrer" style={{ color: '#FFF' }}>
                  <Icon>instagram</Icon>
                </a>
              )}
              {contactConfig.youtube && (
                <a href={contactConfig.youtube} target="_blank" rel="noopener noreferrer" style={{ color: '#FFF' }}>
                  <Icon>video_library</Icon>
                </a>
              )}
            </Box>
          </Grid>
        </Grid>

        {/* Copyright */}
        <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid rgba(255,255,255,0.2)', textAlign: 'center' }}>
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            © {currentYear} {tenant.name}. All rights reserved.
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.7, display: 'block', mt: 1 }}>
            Powered by Pulse of People Platform · v1.0 - {new Date().toISOString().split('T')[0]}
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
