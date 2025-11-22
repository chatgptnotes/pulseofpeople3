"""
URL configuration for user routes
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from api.views.user.profile import UserProfileViewSet
from api.views.tenant_branding import my_tenant_branding

router = DefaultRouter()
router.register(r'profile', UserProfileViewSet, basename='user-profile')

urlpatterns = [
    path('', include(router.urls)),
    path('tenant/branding/', my_tenant_branding, name='my-tenant-branding'),
]
