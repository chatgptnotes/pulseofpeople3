"""
URL routes for role-based dashboards
"""

from django.urls import path
from api.views.dashboard_views import (
    dashboard_login,
    dashboard_logout,
    dashboard_router,
    superadmin_dashboard,
    state_admin_dashboard,
    zone_admin_dashboard,
    district_admin_dashboard,
    constituency_admin_dashboard,
    booth_admin_dashboard,
    analyst_dashboard,
)

urlpatterns = [
    # Authentication
    path('login/', dashboard_login, name='dashboard_login'),
    path('logout/', dashboard_logout, name='dashboard_logout'),

    # Auto-router
    path('dashboard/', dashboard_router, name='dashboard_router'),

    # Role-specific dashboards
    path('dashboard/superadmin/', superadmin_dashboard, name='superadmin_dashboard'),
    path('dashboard/state-admin/', state_admin_dashboard, name='state_admin_dashboard'),
    path('dashboard/zone-admin/', zone_admin_dashboard, name='zone_admin_dashboard'),
    path('dashboard/district-admin/', district_admin_dashboard, name='district_admin_dashboard'),
    path('dashboard/constituency-admin/', constituency_admin_dashboard, name='constituency_admin_dashboard'),
    path('dashboard/booth-admin/', booth_admin_dashboard, name='booth_admin_dashboard'),
    path('dashboard/analyst/', analyst_dashboard, name='analyst_dashboard'),
]
