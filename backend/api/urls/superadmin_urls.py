"""
URL configuration for superadmin routes
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from api.views.superadmin.user_management import SuperAdminUserManagementViewSet
from api.views.superadmin import tenant_views

router = DefaultRouter()
router.register(r'users', SuperAdminUserManagementViewSet, basename='superadmin-users')

urlpatterns = [
    path('', include(router.urls)),

    # Tenant management endpoints
    path('tenants/stats/', tenant_views.get_tenant_stats, name='superadmin-tenant-stats'),
    path('tenants/by-subdomain/<str:subdomain>/', tenant_views.get_tenant_by_subdomain, name='tenant-by-subdomain'),  # Public
    path('tenants/', tenant_views.list_tenants, name='superadmin-list-tenants'),
    path('tenants/<int:tenant_id>/', tenant_views.get_tenant_detail, name='superadmin-tenant-detail'),
    path('tenants/<int:tenant_id>/config/', tenant_views.get_tenant_config, name='tenant-config'),  # Public
    path('tenants/<int:tenant_id>/branding/', tenant_views.update_tenant_branding, name='update-tenant-branding'),  # Superadmin only
    path('tenants/<int:tenant_id>/update/', tenant_views.update_tenant, name='update-tenant'),  # Superadmin only
]
