"""
Dashboard views for role-based routing and rendering
"""

from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.db.models import Count
from api.models import User, UserProfile, Organization


def dashboard_login(request):
    """Login view with automatic role-based routing"""
    # If already logged in, redirect to dashboard
    if request.user.is_authenticated:
        return redirect('dashboard_router')

    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        remember = request.POST.get('remember')

        user = authenticate(request, username=username, password=password)

        if user is not None:
            login(request, user)

            # Set session expiry
            if not remember:
                request.session.set_expiry(0)  # Session expires when browser closes
            else:
                request.session.set_expiry(1209600)  # 2 weeks

            messages.success(request, f'Welcome back, {user.username}!')

            # Redirect to next page or dashboard router
            next_url = request.POST.get('next') or request.GET.get('next')
            if next_url:
                return redirect(next_url)
            return redirect('dashboard_router')
        else:
            messages.error(request, 'Invalid username or password. Please try again.')

    return render(request, 'auth/login.html')


def dashboard_logout(request):
    """Logout view"""
    logout(request)
    messages.info(request, 'You have been logged out successfully.')
    return redirect('dashboard_login')


@login_required(login_url='/login/')
def dashboard_router(request):
    """
    Automatic dashboard router based on user role
    Redirects users to their appropriate dashboard
    """
    try:
        profile = request.user.profile
        role = profile.role

        # Route based on role
        role_routes = {
            'superadmin': 'superadmin_dashboard',
            'state_admin': 'state_admin_dashboard',
            'zone_admin': 'zone_admin_dashboard',
            'district_admin': 'district_admin_dashboard',
            'constituency_admin': 'constituency_admin_dashboard',
            'booth_admin': 'booth_admin_dashboard',
            'analyst': 'analyst_dashboard',
        }

        route = role_routes.get(role)
        if route:
            return redirect(route)
        else:
            messages.error(request, f'Unknown role: {role}')
            return redirect('dashboard_login')

    except UserProfile.DoesNotExist:
        messages.error(request, 'User profile not found. Please contact administrator.')
        logout(request)
        return redirect('dashboard_login')


@login_required(login_url='/login/')
def superadmin_dashboard(request):
    """SuperAdmin dashboard"""
    # Check role
    if not request.user.profile.is_superadmin():
        messages.error(request, 'Access denied. SuperAdmin access required.')
        return redirect('dashboard_router')

    # Get statistics
    total_users = User.objects.count()
    total_organizations = Organization.objects.count()

    # User role distribution
    role_stats = UserProfile.objects.values('role').annotate(count=Count('role'))
    role_dict = {item['role']: item['count'] for item in role_stats}

    stats = {
        'total_users': total_users,
        'total_organizations': total_organizations,
        'active_tenants': Organization.objects.filter(subscription_status='active').count(),
        'superadmins': role_dict.get('superadmin', 0),
        'state_admins': role_dict.get('state_admin', 0),
        'zone_admins': role_dict.get('zone_admin', 0),
        'district_admins': role_dict.get('district_admin', 0),
        'constituency_admins': role_dict.get('constituency_admin', 0),
        'booth_admins': role_dict.get('booth_admin', 0),
        'analysts': role_dict.get('analyst', 0),
    }

    # Get organizations
    organizations = Organization.objects.all()[:10]

    context = {
        'stats': stats,
        'organizations': organizations,
        'recent_activities': [],  # TODO: Implement activity tracking
    }

    return render(request, 'dashboards/superadmin_dashboard.html', context)


@login_required(login_url='/login/')
def state_admin_dashboard(request):
    """State Admin dashboard"""
    if not request.user.profile.is_state_admin():
        messages.error(request, 'Access denied. State Admin access required.')
        return redirect('dashboard_router')

    stats = {
        'total_zones': 0,  # TODO: Calculate from assigned state
        'total_districts': 0,
        'total_constituencies': 0,
        'zone_admins': 0,
    }

    return render(request, 'dashboards/state_admin_dashboard.html', {'stats': stats})


@login_required(login_url='/login/')
def zone_admin_dashboard(request):
    """Zone Admin dashboard"""
    if not request.user.profile.is_zone_admin():
        messages.error(request, 'Access denied. Zone Admin access required.')
        return redirect('dashboard_router')

    stats = {
        'total_districts': 0,
        'total_constituencies': 0,
        'district_admins': 0,
    }

    return render(request, 'dashboards/zone_admin_dashboard.html', {'stats': stats})


@login_required(login_url='/login/')
def district_admin_dashboard(request):
    """District Admin dashboard"""
    if not request.user.profile.is_district_admin():
        messages.error(request, 'Access denied. District Admin access required.')
        return redirect('dashboard_router')

    stats = {
        'total_constituencies': 0,
        'constituency_admins': 0,
    }

    return render(request, 'dashboards/district_admin_dashboard.html', {'stats': stats})


@login_required(login_url='/login/')
def constituency_admin_dashboard(request):
    """Constituency Admin dashboard"""
    if not request.user.profile.is_constituency_admin():
        messages.error(request, 'Access denied. Constituency Admin access required.')
        return redirect('dashboard_router')

    stats = {
        'total_booths': 0,
        'booth_admins': 0,
    }

    return render(request, 'dashboards/constituency_admin_dashboard.html', {'stats': stats})


@login_required(login_url='/login/')
def booth_admin_dashboard(request):
    """Booth Admin dashboard"""
    if not request.user.profile.is_booth_admin():
        messages.error(request, 'Access denied. Booth Admin access required.')
        return redirect('dashboard_router')

    stats = {
        'total_voters': 0,
        'analysts': 0,
    }

    return render(request, 'dashboards/booth_admin_dashboard.html', {'stats': stats})


@login_required(login_url='/login/')
def analyst_dashboard(request):
    """Analyst dashboard (read-only)"""
    if not request.user.profile.is_analyst():
        messages.error(request, 'Access denied. Analyst access required.')
        return redirect('dashboard_router')

    stats = {
        'total_reports': 5,
        'total_analytics': 8,
    }

    return render(request, 'dashboards/analyst_dashboard.html', {'stats': stats})
