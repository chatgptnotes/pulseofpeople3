import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Avatar,
  Alert,
  Tabs,
  Tab,
  Divider,
  IconButton,
  CircularProgress,
} from '@mui/material';
import {
  CloudUpload,
  Save,
  Cancel,
  RestartAlt,
  Preview,
  Delete,
  Add,
} from '@mui/icons-material';
import { useTenant } from '../../contexts/TenantContext';
import { useAuth } from '../../contexts/AuthContext';
import { usePermission } from '../../hooks/usePermission';
import { useToast } from '../../contexts/ToastContext';
import PageHeader from '../../components/PageHeader';
import { clearTenantCache } from '../../lib/tenant/config';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

interface BrandingFormData {
  logo_url: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  hero_title: string;
  hero_subtitle: string;
  meta_description: string;
  custom_css: string;
}

export default function TenantBranding() {
  const { tenant, isLoading: tenantLoading, reload } = useTenant();
  const { user } = useAuth();
  const { showToast } = useToast();
  const hasPermission = usePermission('edit_settings');

  const [activeTab, setActiveTab] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const [formData, setFormData] = useState<BrandingFormData>({
    logo_url: '',
    primary_color: '#1976D2',
    secondary_color: '#424242',
    accent_color: '#FF9800',
    hero_title: '',
    hero_subtitle: '',
    meta_description: '',
    custom_css: '',
  });

  // Load existing branding data from Django API
  useEffect(() => {
    const fetchBrandingData = async () => {
      try {
        const djangoApiUrl = import.meta.env.VITE_DJANGO_API_URL || 'http://127.0.0.1:8000/api';
        const response = await fetch(`${djangoApiUrl}/user/tenant/branding/`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('pulseofpeople_access_token')}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log('[TenantBranding] Loaded branding data:', data);

          // Backend returns { tenant: { branding: {} } } structure
          const brandingData = data.tenant?.branding || data.branding || {};
          const tenantName = data.tenant?.name || data.name || '';

          setFormData({
            logo_url: brandingData.logo_url || '',
            primary_color: brandingData.primary_color || '#1976D2',
            secondary_color: brandingData.secondary_color || '#424242',
            accent_color: brandingData.accent_color || '#FF9800',
            hero_title: brandingData.hero_title || tenantName,
            hero_subtitle: brandingData.hero_subtitle || '',
            meta_description: brandingData.meta_description || '',
            custom_css: brandingData.custom_css || '',
          });
          setLogoPreview(brandingData.logo_url || null);
          console.log('[TenantBranding] Form data set:', { logo_url: brandingData.logo_url });
        } else {
          console.warn('[TenantBranding] Failed to load branding data:', response.status);
          // Fallback to tenant context data
          if (tenant?.branding) {
            setFormData({
              logo_url: tenant.branding.logo_url || tenant.branding.logo || '',
              primary_color: tenant.branding.primary_color || tenant.branding.primaryColor || '#1976D2',
              secondary_color: tenant.branding.secondary_color || tenant.branding.secondaryColor || '#424242',
              accent_color: tenant.branding.accent_color || '#FF9800',
              hero_title: tenant.branding.hero_title || tenant.name || '',
              hero_subtitle: tenant.branding.hero_subtitle || '',
              meta_description: tenant.branding.meta_description || '',
              custom_css: tenant.branding.custom_css || '',
            });
            setLogoPreview(tenant.branding.logo_url || tenant.branding.logo || null);
          }
        }
      } catch (error) {
        console.error('[TenantBranding] Error fetching branding:', error);
        // Fallback to tenant context data
        if (tenant?.branding) {
          setFormData({
            logo_url: tenant.branding.logo_url || tenant.branding.logo || '',
            primary_color: tenant.branding.primary_color || tenant.branding.primaryColor || '#1976D2',
            secondary_color: tenant.branding.secondary_color || tenant.branding.secondaryColor || '#424242',
            accent_color: tenant.branding.accent_color || '#FF9800',
            hero_title: tenant.branding.hero_title || tenant.name || '',
            hero_subtitle: tenant.branding.hero_subtitle || '',
            meta_description: tenant.branding.meta_description || '',
            custom_css: tenant.branding.custom_css || '',
          });
          setLogoPreview(tenant.branding.logo_url || tenant.branding.logo || null);
        }
      }
    };

    if (user) {
      fetchBrandingData();
    }
  }, [tenant, user]);

  const handleInputChange = (field: keyof BrandingFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Prevent any default behavior that might cause navigation
    event.preventDefault();
    event.stopPropagation();

    console.log('[TenantBranding] File input changed');

    const file = event.target.files?.[0];
    if (file) {
      console.log('[TenantBranding] File selected:', { name: file.name, size: file.size, type: file.type });

      if (file.size > 2 * 1024 * 1024) {
        const errorMsg = 'Logo file size must be less than 2MB';
        console.error('[TenantBranding] File too large:', file.size);
        setSaveError(errorMsg);
        showToast(errorMsg, 'error');
        return;
      }

      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        console.log('[TenantBranding] File read complete, preview ready');
        setLogoPreview(reader.result as string);
        setSaveError(null); // Clear any previous errors
      };
      reader.onerror = () => {
        console.error('[TenantBranding] File read error');
        showToast('Failed to read file', 'error');
      };
      reader.readAsDataURL(file);
    } else {
      console.log('[TenantBranding] No file selected');
    }
  };

  const handleRemoveLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    setFormData((prev) => ({ ...prev, logo_url: '' }));
  };

  const handleSave = async () => {
    console.log('[TenantBranding] Save clicked');
    setIsSaving(true);
    setSaveSuccess(false);
    setSaveError(null);

    try {
      const djangoApiUrl = import.meta.env.VITE_DJANGO_API_URL || 'http://127.0.0.1:8000/api';

      // Prepare branding data
      const brandingData = {
        branding: {
          ...formData,
          logo_url: logoPreview || formData.logo_url,
        },
      };

      console.log('[TenantBranding] Saving branding data:', {
        hasLogo: !!brandingData.branding.logo_url,
        logoLength: brandingData.branding.logo_url?.length || 0,
        colors: {
          primary: brandingData.branding.primary_color,
          secondary: brandingData.branding.secondary_color,
          accent: brandingData.branding.accent_color,
        }
      });

      // Update tenant branding via Django API
      // Use user-specific endpoint (not superadmin endpoint)
      const response = await fetch(`${djangoApiUrl}/user/tenant/branding/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('pulseofpeople_access_token')}`,
        },
        body: JSON.stringify(brandingData),
      });

      console.log('[TenantBranding] API response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('[TenantBranding] API error:', errorData);
        throw new Error(errorData.error || 'Failed to update tenant branding');
      }

      // Show success toast instead of page reload
      showToast('Branding updated successfully!', 'success');
      setSaveSuccess(true);

      // Update form data with the saved logo URL
      if (logoPreview) {
        setFormData(prev => ({
          ...prev,
          logo_url: logoPreview
        }));
      }

      // Clear the temporary logo file after successful save
      setLogoFile(null);

      // Clear tenant cache to force reload of branding on subdomain
      console.log('[TenantBranding] Clearing tenant cache for:', tenant?.slug || tenant?.subdomain);
      clearTenantCache(tenant?.slug || tenant?.subdomain);

      // Reload tenant context to apply changes immediately
      if (reload) {
        console.log('[TenantBranding] Reloading tenant context...');
        await reload();
      }

      // Note: Page reload removed to prevent auth issues
      // The new branding will be applied on next page load or manual refresh

    } catch (error) {
      console.error('Error saving branding:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save branding';
      setSaveError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (tenant?.branding) {
      setFormData({
        logo_url: tenant.branding.logo_url || '',
        primary_color: tenant.branding.primary_color || '#1976D2',
        secondary_color: tenant.branding.secondary_color || '#424242',
        accent_color: tenant.branding.accent_color || '#FF9800',
        hero_title: tenant.branding.hero_title || tenant.name || '',
        hero_subtitle: tenant.branding.hero_subtitle || '',
        meta_description: tenant.branding.meta_description || '',
        custom_css: tenant.branding.custom_css || '',
      });
      setLogoPreview(tenant.branding.logo_url || null);
      setLogoFile(null);
    }
  };

  if (tenantLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!hasPermission) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          You do not have permission to access this page. Only State Admins can customize tenant branding.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <PageHeader
        title="Tenant Branding"
        subtitle={`Customize the branding and appearance of ${tenant?.name || 'your organization'}`}
      />

      {saveSuccess && (
        <Alert
          severity="success"
          sx={{ mb: 3 }}
          onClose={() => setSaveSuccess(false)}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => window.location.reload()}
            >
              Refresh Now
            </Button>
          }
        >
          Branding updated successfully! Logo will now appear on your subdomain website. Click "Refresh Now" to see changes in sidebar and navbar immediately.
        </Alert>
      )}

      {saveError && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setSaveError(null)}>
          {saveError}
        </Alert>
      )}

      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
            <Tab label="Logo & Colors" />
            <Tab label="Landing Page" />
            <Tab label="Advanced" />
          </Tabs>
        </Box>

        {/* Tab 1: Logo & Colors */}
        <TabPanel value={activeTab} index={0}>
          <Grid container spacing={3}>
            {/* Logo Upload Section */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Organization Logo
              </Typography>
              <Box
                sx={{
                  border: '2px dashed #ccc',
                  borderRadius: 2,
                  p: 3,
                  textAlign: 'center',
                  backgroundColor: '#f9f9f9',
                }}
              >
                {logoPreview ? (
                  <Box>
                    <img
                      src={logoPreview}
                      alt="Logo Preview"
                      style={{
                        maxWidth: '100%',
                        maxHeight: '200px',
                        objectFit: 'contain',
                        marginBottom: '16px',
                      }}
                    />
                    <Box>
                      <Button
                        variant="outlined"
                        color="error"
                        startIcon={<Delete />}
                        onClick={handleRemoveLogo}
                      >
                        Remove Logo
                      </Button>
                    </Box>
                  </Box>
                ) : (
                  <Box>
                    <CloudUpload sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      Upload your organization logo
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Recommended: PNG or SVG, max 2MB
                    </Typography>
                  </Box>
                )}
                <Button
                  variant="contained"
                  component="label"
                  type="button"
                  startIcon={<CloudUpload />}
                  sx={{ mt: 2 }}
                >
                  Upload Logo
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleLogoUpload}
                    onClick={(e) => {
                      // Allow file picker to open but prevent form submission
                      e.stopPropagation();
                    }}
                  />
                </Button>
              </Box>
            </Grid>

            {/* Color Pickers */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Brand Colors
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="body2" gutterBottom>
                    Primary Color (Sidebar, Main Buttons)
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <input
                      type="color"
                      value={formData.primary_color}
                      onChange={(e) => {
                        e.preventDefault();
                        handleInputChange('primary_color', e.target.value);
                      }}
                      style={{
                        width: '60px',
                        height: '40px',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        cursor: 'pointer',
                      }}
                    />
                    <TextField
                      value={formData.primary_color}
                      onChange={(e) => handleInputChange('primary_color', e.target.value)}
                      size="small"
                      fullWidth
                    />
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="body2" gutterBottom>
                    Secondary Color (Footer, Secondary Elements)
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <input
                      type="color"
                      value={formData.secondary_color}
                      onChange={(e) => {
                        e.preventDefault();
                        handleInputChange('secondary_color', e.target.value);
                      }}
                      style={{
                        width: '60px',
                        height: '40px',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        cursor: 'pointer',
                      }}
                    />
                    <TextField
                      value={formData.secondary_color}
                      onChange={(e) => handleInputChange('secondary_color', e.target.value)}
                      size="small"
                      fullWidth
                    />
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="body2" gutterBottom>
                    Accent Color (Highlights, Links)
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <input
                      type="color"
                      value={formData.accent_color}
                      onChange={(e) => {
                        e.preventDefault();
                        handleInputChange('accent_color', e.target.value);
                      }}
                      style={{
                        width: '60px',
                        height: '40px',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        cursor: 'pointer',
                      }}
                    />
                    <TextField
                      value={formData.accent_color}
                      onChange={(e) => handleInputChange('accent_color', e.target.value)}
                      size="small"
                      fullWidth
                    />
                  </Box>
                </Grid>
              </Grid>

              {/* Color Preview */}
              <Box sx={{ mt: 3 }}>
                <Typography variant="body2" gutterBottom>
                  Preview:
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                  <Box
                    sx={{
                      width: 60,
                      height: 60,
                      backgroundColor: formData.primary_color,
                      borderRadius: 1,
                      border: '1px solid #ccc',
                    }}
                  />
                  <Box
                    sx={{
                      width: 60,
                      height: 60,
                      backgroundColor: formData.secondary_color,
                      borderRadius: 1,
                      border: '1px solid #ccc',
                    }}
                  />
                  <Box
                    sx={{
                      width: 60,
                      height: 60,
                      backgroundColor: formData.accent_color,
                      borderRadius: 1,
                      border: '1px solid #ccc',
                    }}
                  />
                </Box>
              </Box>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Tab 2: Landing Page */}
        <TabPanel value={activeTab} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                label="Hero Title"
                fullWidth
                value={formData.hero_title}
                onChange={(e) => handleInputChange('hero_title', e.target.value)}
                placeholder="Enter main headline for your landing page"
                helperText="This will be displayed prominently on your landing page"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Hero Subtitle"
                fullWidth
                multiline
                rows={2}
                value={formData.hero_subtitle}
                onChange={(e) => handleInputChange('hero_subtitle', e.target.value)}
                placeholder="Enter subtitle or tagline"
                helperText="Supporting text that appears below the main title"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Meta Description"
                fullWidth
                multiline
                rows={2}
                value={formData.meta_description}
                onChange={(e) => handleInputChange('meta_description', e.target.value)}
                placeholder="Enter meta description for SEO"
                helperText="This will be used for search engine results (max 160 characters)"
                inputProps={{ maxLength: 160 }}
              />
            </Grid>

            <Grid item xs={12}>
              <Alert severity="info">
                Additional landing page sections (Features, Stats, Testimonials) can be added in future updates.
              </Alert>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Tab 3: Advanced */}
        <TabPanel value={activeTab} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Custom CSS (Advanced)
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={10}
                value={formData.custom_css}
                onChange={(e) => handleInputChange('custom_css', e.target.value)}
                placeholder="Enter custom CSS code..."
                helperText="Add custom CSS to override default styles (use with caution)"
                sx={{ fontFamily: 'monospace' }}
              />
            </Grid>

            <Grid item xs={12}>
              <Alert severity="warning">
                Custom CSS is for advanced users only. Incorrect CSS may break your site's appearance.
              </Alert>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Action Buttons */}
        <Divider />
        <Box sx={{ p: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            startIcon={<RestartAlt />}
            onClick={handleReset}
            disabled={isSaving}
          >
            Reset
          </Button>
          <Button
            variant="outlined"
            startIcon={<Cancel />}
            onClick={() => window.history.back()}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            startIcon={isSaving ? <CircularProgress size={20} /> : <Save />}
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </Box>
      </Card>

      {/* Version Footer */}
      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Typography variant="caption" color="textSecondary">
          v6.4 - 2025-11-21
        </Typography>
      </Box>
    </Box>
  );
}
