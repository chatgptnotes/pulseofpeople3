"""
Database connectivity checker utility
Provides functions to test database connection health
"""
from django.db import connection, OperationalError, InterfaceError
from django.db.utils import DatabaseError
import logging

logger = logging.getLogger(__name__)


def check_database_connection():
    """
    Check if database connection is active and healthy.

    Returns:
        dict: {
            'connected': bool,
            'error': str or None,
            'details': str or None
        }
    """
    try:
        # Try to access the database
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            result = cursor.fetchone()

            if result and result[0] == 1:
                return {
                    'connected': True,
                    'error': None,
                    'details': 'Database connection successful'
                }
            else:
                return {
                    'connected': False,
                    'error': 'database_query_failed',
                    'details': 'Database query returned unexpected result'
                }

    except OperationalError as e:
        logger.error(f"[DB Check] Operational Error: {str(e)}")
        return {
            'connected': False,
            'error': 'database_connection_failed',
            'details': f'Database connection failed: {str(e)}'
        }

    except InterfaceError as e:
        logger.error(f"[DB Check] Interface Error: {str(e)}")
        return {
            'connected': False,
            'error': 'database_interface_error',
            'details': f'Database interface error: {str(e)}'
        }

    except DatabaseError as e:
        logger.error(f"[DB Check] Database Error: {str(e)}")
        return {
            'connected': False,
            'error': 'database_error',
            'details': f'Database error: {str(e)}'
        }

    except Exception as e:
        logger.error(f"[DB Check] Unexpected Error: {str(e)}")
        return {
            'connected': False,
            'error': 'unknown_database_error',
            'details': f'Unexpected error: {str(e)}'
        }


def get_database_status():
    """
    Get detailed database status information.

    Returns:
        dict: Database status with connection info
    """
    db_check = check_database_connection()

    status = {
        'status': 'connected' if db_check['connected'] else 'disconnected',
        'connected': db_check['connected'],
        'database_type': connection.settings_dict.get('ENGINE', 'unknown').split('.')[-1],
    }

    if not db_check['connected']:
        status['error'] = db_check['error']
        status['error_details'] = db_check['details']

    return status


def ensure_database_connection():
    """
    Ensure database connection is active, raise exception if not.

    Raises:
        DatabaseError: If database connection is not available

    Returns:
        bool: True if connection is active
    """
    db_check = check_database_connection()

    if not db_check['connected']:
        error_msg = db_check.get('details', 'Database connection unavailable')
        raise DatabaseError(error_msg)

    return True
