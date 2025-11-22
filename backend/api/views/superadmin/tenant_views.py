"""
Tenant/Organization management views for SuperAdmin
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from api.models import Organization, UserProfile
from api.permissions.role_permissions import IsSuperAdmin
from api.serializers import OrganizationSerializer
from django.contrib.auth import get_user_model

User = get_user_model()


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsSuperAdmin])
def get_tenant_stats(request):
    """
    Get tenant/organization statistics for SuperAdmin dashboard
    """
    total_tenants = Organization.objects.count()
    active_tenants = Organization.objects.filter(subscription_status='active').count()
    trial_tenants = Organization.objects.filter(subscription_tier='trial').count()

    return Response({
        'total_tenants': total_tenants,
        'active_tenants': active_tenants,
        'trial_tenants': trial_tenants
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsSuperAdmin])
def list_tenants(request):
    """
    List all tenants/organizations with details
    """
    tenants = Organization.objects.all().order_by('-created_at')

    tenants_data = []
    for org in tenants:
        # Count users in this org
        user_count = UserProfile.objects.filter(organization=org).count()

        # Get admin users
        admins = UserProfile.objects.filter(
            organization=org,
            role__in=['state_admin', 'admin']
        )

        tenants_data.append({
            'id': org.id,
            'name': org.name,
            'slug': org.slug,
            'party_name': org.party_name,
            'party_symbol': org.party_symbol,
            'party_color': org.party_color,
            'subscription_status': org.subscription_status,
            'subscription_tier': org.subscription_tier,
            'max_users': org.max_users,
            'current_users': user_count,
            'admins': [
                {
                    'username': admin.user.username,
                    'email': admin.user.email,
                    'role': admin.role
                } for admin in admins[:3]  # Show max 3 admins
            ],
            'created_at': org.created_at,
            'updated_at': org.updated_at
        })

    return Response({
        'success': True,
        'count': len(tenants_data),
        'tenants': tenants_data
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsSuperAdmin])
def get_tenant_detail(request, tenant_id):
    """
    Get detailed information about a specific tenant
    """
    try:
        org = Organization.objects.get(id=tenant_id)

        # Get all users in this org
        users = UserProfile.objects.filter(organization=org)
        total_users = users.count()
        active_users = users.filter(user__is_active=True).count()

        # Get users by role
        role_distribution = {}
        for role_choice in UserProfile.ROLE_CHOICES:
            role_code = role_choice[0]
            role_count = users.filter(role=role_code).count()
            if role_count > 0:
                role_distribution[role_code] = role_count

        return Response({
            'success': True,
            'tenant': {
                'id': org.id,
                'name': org.name,
                'party_name': org.party_name,
                'party_symbol': org.party_symbol,
                'party_color': org.party_color,
                'subscription_status': org.subscription_status,
                'subscription_tier': org.subscription_tier,
                'max_users': org.max_users,
                'stats': {
                    'total_users': total_users,
                    'active_users': active_users,
                    'role_distribution': role_distribution
                },
                'created_at': org.created_at,
                'updated_at': org.updated_at
            }
        })

    except Organization.DoesNotExist:
        return Response({
            'success': False,
            'error': 'Tenant not found'
        }, status=404)


@api_view(['GET'])
@permission_classes([AllowAny])  # Public endpoint - no auth required
def get_tenant_by_subdomain(request, subdomain):
    """
    Get tenant/organization by subdomain (public endpoint for frontend)
    Used by frontend TenantContext to load tenant configuration

    Example: GET /api/tenants/by-subdomain/bjp/
    """
    try:
        org = Organization.objects.get(subdomain=subdomain, is_active=True)
        serializer = OrganizationSerializer(org)

        return Response({
            'success': True,
            'tenant': serializer.data
        })

    except Organization.DoesNotExist:
        return Response({
            'success': False,
            'error': f'Tenant with subdomain "{subdomain}" not found or inactive'
        }, status=404)


@api_view(['GET'])
@permission_classes([AllowAny])  # Public endpoint
def get_tenant_config(request, tenant_id):
    """
    Get full tenant configuration including all JSONB fields
    Public endpoint for loading tenant branding

    Example: GET /api/tenants/1/config/
    """
    try:
        org = Organization.objects.get(id=tenant_id, is_active=True)
        serializer = OrganizationSerializer(org)

        return Response({
            'success': True,
            'config': serializer.data
        })

    except Organization.DoesNotExist:
        return Response({
            'success': False,
            'error': 'Tenant not found or inactive'
        }, status=404)


@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated, IsSuperAdmin])
def update_tenant_branding(request, tenant_id):
    """
    Update tenant branding configuration (superadmin only)

    Example: PUT /api/tenants/1/branding/
    Body:
    {
        "branding": {
            "primary_color": "#FF9933",
            "secondary_color": "#138808",
            "logo_url": "/logos/bjp.png",
            "custom_css": "body { font-family: 'Poppins'; }"
        }
    }
    """
    try:
        org = Organization.objects.get(id=tenant_id)

        # Update branding field
        if 'branding' in request.data:
            org.branding = request.data['branding']

        # Also support updating other config fields
        if 'landing_page_config' in request.data:
            org.landing_page_config = request.data['landing_page_config']

        if 'theme_config' in request.data:
            org.theme_config = request.data['theme_config']

        if 'seo_config' in request.data:
            org.seo_config = request.data['seo_config']

        org.save()

        serializer = OrganizationSerializer(org)

        return Response({
            'success': True,
            'message': 'Tenant branding updated successfully',
            'tenant': serializer.data
        })

    except Organization.DoesNotExist:
        return Response({
            'success': False,
            'error': 'Tenant not found'
        }, status=404)


@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated, IsSuperAdmin])
def update_tenant(request, tenant_id):
    """
    Update complete tenant information (superadmin only)

    Example: PUT /api/tenants/1/
    Body: Any Organization fields
    """
    try:
        org = Organization.objects.get(id=tenant_id)
        serializer = OrganizationSerializer(org, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()
            return Response({
                'success': True,
                'message': 'Tenant updated successfully',
                'tenant': serializer.data
            })
        else:
            return Response({
                'success': False,
                'errors': serializer.errors
            }, status=400)

    except Organization.DoesNotExist:
        return Response({
            'success': False,
            'error': 'Tenant not found'
        }, status=404)
