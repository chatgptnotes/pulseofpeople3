"""
Custom authentication views with enhanced error handling
Includes database connectivity pre-checks for better user experience
"""
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.db.utils import DatabaseError
from api.utils.db_check import check_database_connection, get_database_status
import logging

logger = logging.getLogger(__name__)


@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """
    Health check endpoint with database connectivity status.

    Returns:
        Response: System health status including database connection
    """
    db_status = get_database_status()

    response_data = {
        'status': 'healthy' if db_status['connected'] else 'degraded',
        'database': db_status['status'],
        'database_type': db_status.get('database_type', 'unknown')
    }

    # Include error details if database is not connected
    if not db_status['connected']:
        response_data['error'] = db_status.get('error')
        if request.user.is_authenticated and request.user.is_staff:
            response_data['error_details'] = db_status.get('error_details')

    http_status = status.HTTP_200_OK if db_status['connected'] else status.HTTP_503_SERVICE_UNAVAILABLE

    return Response(response_data, status=http_status)


class CustomTokenObtainPairView(TokenObtainPairView):
    """
    Custom JWT token obtain view with database connectivity pre-check.

    Checks database connection before attempting authentication to provide
    clear error messages when database is unavailable.
    """

    def post(self, request, *args, **kwargs):
        """
        Handle token obtain request with database pre-check.

        Returns:
            Response: JWT tokens or error message
        """
        # Check database connectivity before attempting authentication
        db_status = check_database_connection()

        if not db_status['connected']:
            logger.error(
                f"[CustomTokenObtainPairView] Database unavailable: {db_status.get('error')}"
            )

            # Return user-friendly error message
            return Response(
                {
                    'error': 'database_unavailable',
                    'message': 'Unable to connect to database. Please ensure the database service is running and try again.',
                    'details': db_status.get('details') if request.user.is_staff else None,
                    'error_code': db_status.get('error')
                },
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )

        # Database is available, proceed with normal authentication
        try:
            return super().post(request, *args, **kwargs)

        except DatabaseError as e:
            # Catch any database errors that occur during authentication
            logger.error(f"[CustomTokenObtainPairView] Database error during auth: {str(e)}")

            return Response(
                {
                    'error': 'database_error',
                    'message': 'A database error occurred. Please try again or contact support.',
                    'details': str(e) if request.user.is_staff else None
                },
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )

        except Exception as e:
            # Catch any other unexpected errors
            logger.error(f"[CustomTokenObtainPairView] Unexpected error: {str(e)}")

            # Let the parent class handle normal authentication errors
            if 'invalid' in str(e).lower() or 'credentials' in str(e).lower():
                return super().post(request, *args, **kwargs)

            return Response(
                {
                    'error': 'authentication_error',
                    'message': 'An error occurred during authentication. Please try again.',
                    'details': str(e) if request.user.is_staff else None
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class CustomTokenRefreshView(TokenRefreshView):
    """
    Custom JWT token refresh view with database connectivity check.
    """

    def post(self, request, *args, **kwargs):
        """
        Handle token refresh request with database pre-check.

        Returns:
            Response: New access token or error message
        """
        # Check database connectivity
        db_status = check_database_connection()

        if not db_status['connected']:
            logger.error(
                f"[CustomTokenRefreshView] Database unavailable: {db_status.get('error')}"
            )

            return Response(
                {
                    'error': 'database_unavailable',
                    'message': 'Unable to connect to database. Please try logging in again.',
                    'error_code': db_status.get('error')
                },
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )

        # Proceed with normal token refresh
        try:
            return super().post(request, *args, **kwargs)

        except DatabaseError as e:
            logger.error(f"[CustomTokenRefreshView] Database error: {str(e)}")

            return Response(
                {
                    'error': 'database_error',
                    'message': 'A database error occurred. Please try logging in again.',
                },
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
