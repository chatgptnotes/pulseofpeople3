"""
Visibility Scope Utilities for Hierarchical Role-Based Access Control

This module provides utilities to filter querysets based on user's geographic scope:
- SuperAdmin: All data (platform-wide)
- State Admin: State-wide data
- Zone Admin: Zone-wide data
- District Admin: District-wide data
- Constituency Admin: Constituency-wide data
- Booth Admin: Booth-only data
- Analyst: Assigned level data (read-only)
"""
from django.db.models import Q


def get_user_visibility_scope(user):
    """
    Get the user's visibility scope based on their role and geographic assignment.

    Returns a dict with:
        - role: user's role
        - scope: geographic scope level
        - filters: dict of filter kwargs for querysets
    """
    if not hasattr(user, 'profile'):
        return {
            'role': None,
            'scope': 'none',
            'filters': {}
        }

    profile = user.profile
    role = profile.role

    # SuperAdmin: Platform-wide access
    if role == 'superadmin':
        return {
            'role': 'superadmin',
            'scope': 'platform',
            'filters': {}  # No filtering - sees everything
        }

    # State Admin: State-wide access
    if role == 'state_admin':
        filters = {}
        if profile.assigned_state:
            # Use state_ref for ForeignKey, state for CharField
            filters['state_ref'] = profile.assigned_state
        return {
            'role': 'state_admin',
            'scope': 'state',
            'filters': filters
        }

    # Zone Admin: Zone-wide access
    if role == 'zone_admin':
        filters = {}
        if profile.assigned_zone:
            filters['zone_ref'] = profile.assigned_zone
        if profile.assigned_state:
            filters['state_ref'] = profile.assigned_state
        return {
            'role': 'zone_admin',
            'scope': 'zone',
            'filters': filters
        }

    # District Admin: District-wide access
    if role == 'district_admin':
        filters = {}
        if profile.assigned_district:
            filters['district_ref'] = profile.assigned_district
        if profile.assigned_zone:
            filters['zone_ref'] = profile.assigned_zone
        if profile.assigned_state:
            filters['state_ref'] = profile.assigned_state
        return {
            'role': 'district_admin',
            'scope': 'district',
            'filters': filters
        }

    # Constituency Admin: Constituency-wide access
    if role == 'constituency_admin':
        filters = {}
        if profile.assigned_constituency:
            filters['constituency'] = profile.assigned_constituency
        if profile.assigned_district:
            filters['district_ref'] = profile.assigned_district
        if profile.assigned_zone:
            filters['zone_ref'] = profile.assigned_zone
        if profile.assigned_state:
            filters['state_ref'] = profile.assigned_state
        return {
            'role': 'constituency_admin',
            'scope': 'constituency',
            'filters': filters
        }

    # Booth Admin: Booth-only access
    if role == 'booth_admin':
        filters = {}
        if profile.assigned_booth:
            filters['polling_booth'] = profile.assigned_booth
        if profile.assigned_constituency:
            filters['constituency'] = profile.assigned_constituency
        return {
            'role': 'booth_admin',
            'scope': 'booth',
            'filters': filters
        }

    # Analyst: Assigned level access (read-only)
    if role == 'analyst':
        filters = {}
        # Analysts see data at their assigned level
        if profile.assigned_booth:
            filters['polling_booth'] = profile.assigned_booth
        elif profile.assigned_constituency:
            filters['constituency'] = profile.assigned_constituency
        elif profile.assigned_district:
            filters['district'] = profile.assigned_district
        elif profile.assigned_zone:
            filters['zone'] = profile.assigned_zone
        elif profile.assigned_state:
            filters['state'] = profile.assigned_state
        return {
            'role': 'analyst',
            'scope': 'assigned_level',
            'filters': filters
        }

    # Default: No access
    return {
        'role': role,
        'scope': 'none',
        'filters': {}
    }


def filter_constituency_queryset(queryset, user):
    """
    Filter Constituency queryset based on user's visibility scope.
    """
    scope = get_user_visibility_scope(user)

    # SuperAdmin sees everything
    if scope['scope'] == 'platform':
        return queryset

    # Apply filters based on scope
    filters = scope['filters']
    if filters:
        return queryset.filter(**filters)

    # No access
    return queryset.none()


def filter_polling_booth_queryset(queryset, user):
    """
    Filter PollingBooth queryset based on user's visibility scope.
    """
    scope = get_user_visibility_scope(user)

    # SuperAdmin sees everything
    if scope['scope'] == 'platform':
        return queryset

    # Apply filters based on scope
    filters = {}
    user_filters = scope['filters']

    # Map constituency/district/zone/state filters to PollingBooth fields
    if 'polling_booth' in user_filters:
        filters['id'] = user_filters['polling_booth'].id
    elif 'constituency' in user_filters:
        filters['constituency'] = user_filters['constituency']
    elif 'district_ref' in user_filters:
        filters['constituency__district_ref'] = user_filters['district_ref']
    elif 'zone_ref' in user_filters:
        filters['constituency__zone_ref'] = user_filters['zone_ref']
    elif 'state_ref' in user_filters:
        filters['constituency__state_ref'] = user_filters['state_ref']

    if filters:
        return queryset.filter(**filters)

    # No access
    return queryset.none()


def filter_voter_queryset(queryset, user):
    """
    Filter Voter queryset based on user's visibility scope.
    """
    scope = get_user_visibility_scope(user)

    # SuperAdmin sees everything
    if scope['scope'] == 'platform':
        return queryset

    # Apply filters based on scope
    filters = {}
    user_filters = scope['filters']

    # Map filters to Voter fields (through polling_booth relationship)
    if 'polling_booth' in user_filters:
        filters['polling_booth'] = user_filters['polling_booth']
    elif 'constituency' in user_filters:
        filters['polling_booth__constituency'] = user_filters['constituency']
    elif 'district_ref' in user_filters:
        filters['polling_booth__constituency__district_ref'] = user_filters['district_ref']
    elif 'zone_ref' in user_filters:
        filters['polling_booth__constituency__zone_ref'] = user_filters['zone_ref']
    elif 'state_ref' in user_filters:
        filters['polling_booth__constituency__state_ref'] = user_filters['state_ref']

    if filters:
        return queryset.filter(**filters)

    # No access
    return queryset.none()


def filter_campaign_queryset(queryset, user):
    """
    Filter Campaign queryset based on user's visibility scope.
    """
    scope = get_user_visibility_scope(user)

    # SuperAdmin sees everything
    if scope['scope'] == 'platform':
        return queryset

    # Apply filters based on scope
    filters = {}
    user_filters = scope['filters']

    # Map filters to Campaign fields
    if 'constituency' in user_filters:
        filters['constituency'] = user_filters['constituency']
    elif 'district_ref' in user_filters:
        filters['constituency__district_ref'] = user_filters['district_ref']
    elif 'zone_ref' in user_filters:
        filters['constituency__zone_ref'] = user_filters['zone_ref']
    elif 'state_ref' in user_filters:
        filters['constituency__state_ref'] = user_filters['state_ref']

    if filters:
        return queryset.filter(**filters)

    # No access
    return queryset.none()


def filter_user_queryset(queryset, user):
    """
    Filter User queryset based on user's visibility scope.
    Shows users that the current user can see/manage.
    """
    scope = get_user_visibility_scope(user)

    # SuperAdmin sees all users
    if scope['scope'] == 'platform':
        return queryset

    # Filter users based on geographic assignment
    profile = user.profile
    q_filters = Q()

    if scope['scope'] == 'state':
        q_filters |= Q(profile__assigned_state=profile.assigned_state)
    elif scope['scope'] == 'zone':
        q_filters |= Q(profile__assigned_zone=profile.assigned_zone)
    elif scope['scope'] == 'district':
        q_filters |= Q(profile__assigned_district=profile.assigned_district)
    elif scope['scope'] == 'constituency':
        q_filters |= Q(profile__assigned_constituency=profile.assigned_constituency)
    elif scope['scope'] == 'booth':
        q_filters |= Q(profile__assigned_booth=profile.assigned_booth)

    # Also show users created by this user
    q_filters |= Q(profile__created_by=user)

    if q_filters:
        return queryset.filter(q_filters).distinct()

    # No access
    return queryset.none()


def can_user_access_object(user, obj):
    """
    Check if user can access a specific object based on geographic scope.

    Args:
        user: The user requesting access
        obj: The object to check (Constituency, PollingBooth, Voter, etc.)

    Returns:
        bool: True if user can access, False otherwise
    """
    scope = get_user_visibility_scope(user)

    # SuperAdmin can access everything
    if scope['scope'] == 'platform':
        return True

    profile = user.profile

    # Check based on object type
    obj_type = type(obj).__name__

    if obj_type == 'Constituency':
        if scope['scope'] == 'state':
            # Use state_ref (ForeignKey) if available, otherwise fall back to state CharField
            obj_state = obj.state_ref if hasattr(obj, 'state_ref') and obj.state_ref else None
            return obj_state == profile.assigned_state if obj_state else False
        elif scope['scope'] == 'zone':
            obj_zone = obj.zone_ref if hasattr(obj, 'zone_ref') and obj.zone_ref else None
            return obj_zone == profile.assigned_zone if obj_zone else False
        elif scope['scope'] == 'district':
            obj_district = obj.district_ref if hasattr(obj, 'district_ref') and obj.district_ref else None
            return obj_district == profile.assigned_district if obj_district else False
        elif scope['scope'] == 'constituency':
            return obj == profile.assigned_constituency

    elif obj_type == 'PollingBooth':
        if scope['scope'] == 'state':
            constituency = obj.constituency
            obj_state = constituency.state_ref if hasattr(constituency, 'state_ref') and constituency.state_ref else None
            return obj_state == profile.assigned_state if obj_state else False
        elif scope['scope'] == 'zone':
            constituency = obj.constituency
            obj_zone = constituency.zone_ref if hasattr(constituency, 'zone_ref') and constituency.zone_ref else None
            return obj_zone == profile.assigned_zone if obj_zone else False
        elif scope['scope'] == 'district':
            constituency = obj.constituency
            obj_district = constituency.district_ref if hasattr(constituency, 'district_ref') and constituency.district_ref else None
            return obj_district == profile.assigned_district if obj_district else False
        elif scope['scope'] == 'constituency':
            return obj.constituency == profile.assigned_constituency
        elif scope['scope'] == 'booth':
            return obj == profile.assigned_booth

    elif obj_type == 'Voter':
        if scope['scope'] == 'state':
            constituency = obj.polling_booth.constituency
            obj_state = constituency.state_ref if hasattr(constituency, 'state_ref') and constituency.state_ref else None
            return obj_state == profile.assigned_state if obj_state else False
        elif scope['scope'] == 'zone':
            constituency = obj.polling_booth.constituency
            obj_zone = constituency.zone_ref if hasattr(constituency, 'zone_ref') and constituency.zone_ref else None
            return obj_zone == profile.assigned_zone if obj_zone else False
        elif scope['scope'] == 'district':
            constituency = obj.polling_booth.constituency
            obj_district = constituency.district_ref if hasattr(constituency, 'district_ref') and constituency.district_ref else None
            return obj_district == profile.assigned_district if obj_district else False
        elif scope['scope'] == 'constituency':
            return obj.polling_booth.constituency == profile.assigned_constituency
        elif scope['scope'] == 'booth':
            return obj.polling_booth == profile.assigned_booth

    # Default: No access
    return False


def get_visibility_scope_summary(user):
    """
    Get a human-readable summary of user's visibility scope.

    Returns:
        str: Description of user's access scope
    """
    scope = get_user_visibility_scope(user)
    role = scope['role']
    scope_level = scope['scope']

    if scope_level == 'platform':
        return "Platform-wide access (all data)"

    profile = user.profile

    if scope_level == 'state':
        return f"State-wide access: {profile.assigned_state.name if profile.assigned_state else 'Not assigned'}"
    elif scope_level == 'zone':
        return f"Zone-wide access: {profile.assigned_zone.name if profile.assigned_zone else 'Not assigned'}"
    elif scope_level == 'district':
        return f"District-wide access: {profile.assigned_district.name if profile.assigned_district else 'Not assigned'}"
    elif scope_level == 'constituency':
        return f"Constituency-wide access: {profile.assigned_constituency.name if profile.assigned_constituency else 'Not assigned'}"
    elif scope_level == 'booth':
        return f"Booth-only access: Booth #{profile.assigned_booth.booth_number if profile.assigned_booth else 'Not assigned'}"
    elif scope_level == 'assigned_level':
        return "Read-only access at assigned level"

    return "No access"
