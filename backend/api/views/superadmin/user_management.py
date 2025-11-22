"""
Superadmin views for managing all users, admins, and roles
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth.models import User
from django.db.models import Q

from api.models import UserProfile, State, Organization
from api.serializers import UserManagementSerializer, UserRoleSerializer
from api.permissions.role_permissions import IsSuperAdmin, CanChangeRole


class SuperAdminUserManagementViewSet(viewsets.ModelViewSet):
    """
    ViewSet for superadmin to manage all users
    - List all users with any role
    - Create new users with any role
    - Update user information
    - Delete users
    - Change user roles
    """
    serializer_class = UserManagementSerializer
    permission_classes = [IsSuperAdmin]
    queryset = User.objects.all().select_related('profile').order_by('-date_joined')

    def get_queryset(self):
        """
        Filter users by role, search query, or status
        """
        queryset = super().get_queryset()

        # Filter by role
        role = self.request.query_params.get('role', None)
        if role:
            queryset = queryset.filter(profile__role=role)

        # Search by username, email, or name
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(username__icontains=search) |
                Q(email__icontains=search) |
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search)
            )

        # Filter by active status
        is_active = self.request.query_params.get('is_active', None)
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')

        return queryset

    def partial_update(self, request, pk=None):
        """
        Update user information (both User and UserProfile)
        """
        user = self.get_object()

        # Update User model fields
        if 'username' in request.data:
            user.username = request.data['username']
        if 'email' in request.data:
            user.email = request.data['email']
        if 'first_name' in request.data:
            user.first_name = request.data['first_name']
        if 'last_name' in request.data:
            user.last_name = request.data['last_name']
        if 'status' in request.data:
            user.is_active = request.data['status'] == 'active'

        user.save()

        # Update UserProfile fields
        profile = user.profile
        if 'phone' in request.data:
            profile.phone = request.data['phone']
        if 'organization_id' in request.data:
            try:
                organization = Organization.objects.get(id=request.data['organization_id'])
                profile.organization = organization
            except Organization.DoesNotExist:
                return Response(
                    {'error': 'Organization not found'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        if 'state_id' in request.data:
            try:
                state = State.objects.get(id=request.data['state_id'])
                profile.assigned_state = state
            except State.DoesNotExist:
                return Response(
                    {'error': 'State not found'},
                    status=status.HTTP_400_BAD_REQUEST
                )

        profile.save()

        return Response({
            'message': 'Admin updated successfully',
            'user': UserManagementSerializer(user).data
        })

    @action(detail=True, methods=['patch'], permission_classes=[CanChangeRole])
    def change_role(self, request, pk=None):
        """
        Change a user's role
        Only superadmins can change roles
        """
        user = self.get_object()
        new_role = request.data.get('role')

        if not new_role:
            return Response(
                {'error': 'Role is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if new_role not in ['superadmin', 'admin', 'user']:
            return Response(
                {'error': 'Invalid role. Must be superadmin, admin, or user'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Update the user's role
        profile = user.profile
        old_role = profile.role
        profile.role = new_role
        profile.save()

        return Response({
            'message': f'User role changed from {old_role} to {new_role}',
            'user': UserManagementSerializer(user).data
        })

    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """
        Get user statistics by role
        """
        total_users = User.objects.count()
        superadmins = User.objects.filter(profile__role='superadmin').count()
        admins = User.objects.filter(profile__role='admin').count()
        users = User.objects.filter(profile__role='user').count()
        active_users = User.objects.filter(is_active=True).count()
        inactive_users = User.objects.filter(is_active=False).count()

        return Response({
            'total_users': total_users,
            'superadmins': superadmins,
            'admins': admins,
            'users': users,
            'active_users': active_users,
            'inactive_users': inactive_users
        })

    @action(detail=True, methods=['post'])
    def toggle_active(self, request, pk=None):
        """
        Toggle user active status
        """
        user = self.get_object()
        user.is_active = not user.is_active
        user.save()

        return Response({
            'message': f'User {"activated" if user.is_active else "deactivated"}',
            'user': UserManagementSerializer(user).data
        })

    @action(detail=False, methods=['get'])
    def admins(self, request):
        """
        Get list of all admins and superadmins
        """
        admins = User.objects.filter(
            Q(profile__role='admin') | Q(profile__role='superadmin')
        ).select_related('profile').order_by('-date_joined')

        serializer = self.get_serializer(admins, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def state_admins(self, request):
        """
        Get list of all state admins with their organization and state details
        """
        state_admins = User.objects.filter(
            profile__role='state_admin'
        ).select_related('profile', 'profile__organization', 'profile__assigned_state').order_by('-date_joined')

        admins_data = []
        for user in state_admins:
            profile = user.profile
            admins_data.append({
                'id': user.id,
                'name': f"{user.first_name} {user.last_name}".strip() or user.username,
                'email': user.email,
                'phone': profile.phone,
                'role': profile.role,
                'status': 'active' if user.is_active else 'inactive',
                'organizationId': profile.organization.id if profile.organization else None,
                'organizationName': profile.organization.party_name if profile.organization and profile.organization.party_name else (profile.organization.name if profile.organization else None),
                'stateName': profile.assigned_state.name if profile.assigned_state else None,
                'totalTenants': 0,  # Placeholder, can calculate based on organization users
                'activeTenants': 0,  # Placeholder
                'createdAt': user.date_joined.isoformat(),
                'lastActive': user.last_login.isoformat() if user.last_login else None,
            })

        return Response({
            'success': True,
            'count': len(admins_data),
            'admins': admins_data
        })

    @action(detail=False, methods=['post'])
    def create_admin(self, request):
        """
        Create a new admin user
        """
        username = request.data.get('username')
        email = request.data.get('email')
        password = request.data.get('password')
        role = request.data.get('role', 'admin')

        if not all([username, email, password]):
            return Response(
                {'error': 'Username, email, and password are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if role not in ['admin', 'superadmin']:
            return Response(
                {'error': 'Role must be admin or superadmin'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check if username or email already exists
        if User.objects.filter(username=username).exists():
            return Response(
                {'error': 'Username already exists'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if User.objects.filter(email=email).exists():
            return Response(
                {'error': 'Email already exists'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Create user
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=request.data.get('first_name', ''),
            last_name=request.data.get('last_name', '')
        )

        # Create or update profile with admin role
        profile, created = UserProfile.objects.get_or_create(user=user)
        profile.role = role
        profile.save()

        return Response(
            {
                'message': f'{role.title()} user created successfully',
                'user': UserManagementSerializer(user).data
            },
            status=status.HTTP_201_CREATED
        )

    @action(detail=False, methods=['get'])
    def states(self, request):
        """
        Get list of all states for state admin assignment
        """
        states = State.objects.all().order_by('name')

        states_data = [{
            'id': state.id,
            'name': state.name,
            'code': state.code
        } for state in states]

        return Response({
            'success': True,
            'count': len(states_data),
            'states': states_data
        })

    @action(detail=False, methods=['post'])
    def create_state_admin(self, request):
        """
        Create a new state admin user with state and organization assignment

        Required fields:
        - username: str
        - email: str
        - password: str
        - state_id: int (ID of the state to assign)
        - organization_id: int (ID of the organization/party to assign)

        Optional fields:
        - first_name: str
        - last_name: str
        - phone: str
        - subdomain: str (unique subdomain for organization landing page)
        """
        username = request.data.get('username')
        email = request.data.get('email')
        password = request.data.get('password')
        state_id = request.data.get('state_id')
        organization_id = request.data.get('organization_id')

        # Validate required fields
        if not all([username, email, password, state_id, organization_id]):
            return Response(
                {'error': 'Username, email, password, state_id, and organization_id are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check if username or email already exists
        if User.objects.filter(username=username).exists():
            return Response(
                {'error': 'Username already exists'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if User.objects.filter(email=email).exists():
            return Response(
                {'error': 'Email already exists'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validate state exists
        try:
            state = State.objects.get(id=state_id)
        except State.DoesNotExist:
            return Response(
                {'error': f'State with ID {state_id} does not exist'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validate organization exists
        try:
            organization = Organization.objects.get(id=organization_id)
        except Organization.DoesNotExist:
            return Response(
                {'error': f'Organization with ID {organization_id} does not exist'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Handle subdomain if provided
        subdomain = request.data.get('subdomain', '').lower().strip()
        if subdomain:
            # Validate subdomain format (alphanumeric and hyphens only)
            import re
            if not re.match(r'^[a-z0-9-]+$', subdomain):
                return Response(
                    {'error': 'Subdomain can only contain lowercase letters, numbers, and hyphens'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Check if subdomain is already taken
            if Organization.objects.filter(subdomain=subdomain).exclude(id=organization_id).exists():
                return Response(
                    {'error': f'Subdomain "{subdomain}" is already taken'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Save subdomain to organization
            organization.subdomain = subdomain
            organization.save()

        # Create user
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=request.data.get('first_name', ''),
            last_name=request.data.get('last_name', '')
        )

        # Create or update profile with state_admin role
        profile, created = UserProfile.objects.get_or_create(user=user)
        profile.role = 'state_admin'
        profile.assigned_state = state
        profile.organization = organization
        profile.phone = request.data.get('phone', '')
        profile.created_by = request.user  # Track who created this user
        profile.save()

        return Response(
            {
                'success': True,
                'message': f'State Admin created successfully for {state.name}',
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'name': f"{user.first_name} {user.last_name}".strip() or user.username,
                    'role': profile.role,
                    'state': state.name,
                    'organization': organization.party_name if organization.party_name else organization.name,
                    'subdomain': organization.subdomain if organization.subdomain else None,
                }
            },
            status=status.HTTP_201_CREATED
        )

    def destroy(self, request, *args, **kwargs):
        """
        Delete a user (superadmin only)
        Includes safety checks to prevent critical deletions
        """
        user = self.get_object()

        # Safety check 1: Prevent deleting yourself
        if user.id == request.user.id:
            return Response(
                {'error': 'You cannot delete yourself. Please ask another superadmin to delete your account.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Safety check 2: Prevent deleting the last superadmin
        if hasattr(user, 'profile') and user.profile.role == 'superadmin':
            superadmin_count = User.objects.filter(profile__role='superadmin', is_active=True).count()
            if superadmin_count <= 1:
                return Response(
                    {'error': 'Cannot delete the last superadmin. There must be at least one superadmin in the system.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

        # Get user name for success message
        user_name = f"{user.first_name} {user.last_name}".strip() or user.username
        user_role = user.profile.role if hasattr(user, 'profile') else 'user'

        # Perform the deletion
        user.delete()

        return Response(
            {
                'success': True,
                'message': f'User {user_name} ({user_role}) deleted successfully'
            },
            status=status.HTTP_200_OK
        )

    @action(detail=False, methods=['post'])
    def check_subdomain(self, request):
        """
        Check if a subdomain is available for use

        POST /api/superadmin/users/check_subdomain/
        {
            "subdomain": "tvk"
        }

        Response:
        {
            "available": true,
            "subdomain": "tvk",
            "preview": "tvk.pulseofpeople.com"
        }
        """
        import re

        subdomain = request.data.get('subdomain', '').lower().strip()

        if not subdomain:
            return Response(
                {
                    'available': False,
                    'error': 'Subdomain is required'
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validate subdomain format (alphanumeric and hyphens only)
        if not re.match(r'^[a-z0-9-]+$', subdomain):
            return Response(
                {
                    'available': False,
                    'error': 'Subdomain can only contain lowercase letters, numbers, and hyphens',
                    'subdomain': subdomain
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check if subdomain length is acceptable (min 2, max 50 characters)
        if len(subdomain) < 2 or len(subdomain) > 50:
            return Response(
                {
                    'available': False,
                    'error': 'Subdomain must be between 2 and 50 characters',
                    'subdomain': subdomain
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check if subdomain is already taken
        is_available = not Organization.objects.filter(subdomain=subdomain).exists()

        response_data = {
            'available': is_available,
            'subdomain': subdomain,
            'preview': f"{subdomain}.pulseofpeople.com"
        }

        if not is_available:
            response_data['error'] = f'Subdomain "{subdomain}" is already taken'

        return Response(response_data)
