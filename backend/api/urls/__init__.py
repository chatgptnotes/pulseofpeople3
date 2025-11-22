from django.urls import path, include
from rest_framework.routers import DefaultRouter
from api.views import UserViewSet, UserProfileViewSet, TaskViewSet, NotificationViewSet, UploadedFileViewSet, profile_me
from api.views.auth_views import CustomTokenObtainPairView, CustomTokenRefreshView, health_check
from api.views.state_config_views import get_states_config

# Create router for viewsets (legacy routes)
router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'profiles', UserProfileViewSet, basename='profile')
router.register(r'tasks', TaskViewSet, basename='task')
router.register(r'notifications', NotificationViewSet, basename='notification')
router.register(r'files', UploadedFileViewSet, basename='file')

urlpatterns = [
    # Health check (with database connectivity status)
    path('health/', health_check, name='health-check'),

    # JWT Authentication (with database pre-checks)
    path('auth/login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', CustomTokenRefreshView.as_view(), name='token_refresh'),
    path('auth/register/', UserViewSet.as_view({'post': 'create'}), name='register'),

    # Profile endpoint
    path('profile/me/', profile_me, name='profile-me'),

    # States configuration (for dynamic map system)
    path('states/config/', get_states_config, name='states-config'),

    # Role-based routes
    path('superadmin/', include('api.urls.superadmin_urls')),
    path('admin/', include('api.urls.admin_urls')),
    path('user/', include('api.urls.user_urls')),

    # Phase 2: Campaign Management APIs
    path('', include('api.urls.campaign_urls')),

    # Phase 3: Hierarchical User Management (Multi-Party CRM)
    path('', include('api.urls.hierarchical_urls')),

    # Router URLs (legacy)
    path('', include(router.urls)),
]
