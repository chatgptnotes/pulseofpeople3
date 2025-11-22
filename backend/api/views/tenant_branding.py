"""
Tenant Branding Views
Allows State Admin to update their own tenant's branding
"""
import logging
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTAuthentication
from api.models import Organization

logger = logging.getLogger(__name__)


@api_view(['GET', 'PATCH'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def my_tenant_branding(request):
    """
    Get or update current user's tenant branding
    Only accessible to State Admin and above
    """
    # Debug logging
    logger.info(f"=== Tenant Branding Request ===")
    logger.info(f"Method: {request.method}")
    logger.info(f"User: {request.user}")
    logger.info(f"Is Authenticated: {request.user.is_authenticated}")
    logger.info(f"Auth Header: {request.META.get('HTTP_AUTHORIZATION', 'MISSING')}")

    try:
        # Get user's organization/tenant
        from api.models import UserProfile
        user_profile = UserProfile.objects.get(user=request.user)
        organization = user_profile.organization

        if not organization:
            return Response(
                {'error': 'User is not associated with any organization'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Check if user has edit_settings permission
        user_permissions = user_profile.get_permissions()
        if 'edit_settings' not in user_permissions and user_profile.role != 'superadmin':
            return Response(
                {'error': 'You do not have permission to edit tenant branding'},
                status=status.HTTP_403_FORBIDDEN
            )

        if request.method == 'GET':
            # Return current branding
            return Response({
                'success': True,
                'tenant': {
                    'id': organization.id,
                    'name': organization.name,
                    'slug': organization.slug,
                    'subdomain': organization.subdomain,
                    'branding': organization.branding or {},
                    'landing_page_config': organization.landing_page_config or {},
                }
            })

        elif request.method == 'PATCH':
            # Update branding
            branding_data = request.data.get('branding', {})

            # Merge with existing branding
            current_branding = organization.branding or {}
            updated_branding = {**current_branding, **branding_data}

            # Update organization
            organization.branding = updated_branding
            organization.save(update_fields=['branding', 'updated_at'])

            return Response({
                'success': True,
                'message': 'Tenant branding updated successfully',
                'tenant': {
                    'id': organization.id,
                    'name': organization.name,
                    'slug': organization.slug,
                    'subdomain': organization.subdomain,
                    'branding': organization.branding,
                    'landing_page_config': organization.landing_page_config or {},
                }
            })

    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
