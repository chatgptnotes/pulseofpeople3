"""
Django management command to create demo users for all 7 roles with proper geographic hierarchy
Usage: python manage.py create_demo_users
"""

from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from api.models import (
    Organization, UserProfile, State, Zone, District,
    Constituency, PollingBooth
)
from django.db import transaction
import json


class Command(BaseCommand):
    help = 'Create demo users for all 7 roles with geographic hierarchy'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing demo users before creating new ones',
        )

    def handle(self, *args, **options):
        self.stdout.write(self.style.MIGRATE_HEADING('\n=== Creating Demo Users for Role Testing ===\n'))

        if options['clear']:
            self.stdout.write('Clearing existing demo data...')
            User.objects.filter(username__startswith='demo_').delete()
            self.stdout.write(self.style.SUCCESS('Cleared demo users'))

        credentials = []

        with transaction.atomic():
            # Step 1: Create Organization (Political Party)
            self.stdout.write('\n1. Creating Organization/Political Party...')
            org, created = Organization.objects.get_or_create(
                slug='bjp-delhi',
                defaults={
                    'name': 'BJP Delhi',
                    'party_name': 'Bharatiya Janata Party',
                    'party_symbol': 'Lotus',
                    'party_color': '#FF9933',
                    'subscription_status': 'active',
                    'subscription_tier': 'premium',
                    'max_users': 1000
                }
            )
            self.stdout.write(self.style.SUCCESS(f'  ✓ Organization: {org.name}'))

            # Step 2: Create Geographic Hierarchy
            self.stdout.write('\n2. Creating Geographic Hierarchy...')

            # State
            state, _ = State.objects.get_or_create(
                code='DL',
                defaults={'name': 'Delhi'}
            )
            self.stdout.write(f'  ✓ State: {state.name}')

            # Zone
            zone, _ = Zone.objects.get_or_create(
                state=state,
                name='North Delhi Zone',
                defaults={'code': 'NDZ', 'description': 'North Delhi Parliamentary Zone'}
            )
            self.stdout.write(f'  ✓ Zone: {zone.name}')

            # District
            district, _ = District.objects.get_or_create(
                zone=zone,
                name='District 5',
                defaults={'code': 'D5'}
            )
            self.stdout.write(f'  ✓ District: {district.name}')

            # Constituency
            constituency, _ = Constituency.objects.get_or_create(
                code='NDL',
                defaults={
                    'name': 'New Delhi',
                    'type': 'parliamentary',
                    'state': 'Delhi',
                    'district': 'New Delhi',
                    'organization': org,
                    'voter_count': 250000,
                    'total_booths': 150,
                    'population': 300000,
                    'area_sq_km': 35.5,
                    'reserved_category': 'general'
                }
            )
            self.stdout.write(f'  ✓ Constituency: {constituency.name}')

            # Polling Booth
            booth, _ = PollingBooth.objects.get_or_create(
                booth_number='123',
                constituency=constituency,
                defaults={
                    'name': 'Government School Connaught Place',
                    'code': 'NDL-123',
                    'organization': org,
                    'address': 'Connaught Place, New Delhi, Delhi 110001',
                    'location': 'Connaught Place, New Delhi',
                    'total_voters': 1500,
                    'status': 'active'
                }
            )
            self.stdout.write(f'  ✓ Polling Booth: Booth #{booth.booth_number}')

            # Step 3: Create Demo Users for All 7 Roles
            self.stdout.write('\n3. Creating Demo Users...\n')

            # Role 1: SuperAdmin (Platform Owner)
            self.stdout.write(self.style.MIGRATE_LABEL('  [1/7] Creating SuperAdmin...'))
            superadmin_user, created = User.objects.get_or_create(
                username='demo_superadmin',
                defaults={
                    'email': 'superadmin@pulseofpeople.com',
                    'first_name': 'Super',
                    'last_name': 'Admin',
                    'is_staff': True,
                    'is_superuser': True,
                    'is_active': True
                }
            )
            if created:
                superadmin_user.set_password('Demo@12345')
                superadmin_user.save()

            superadmin_profile, _ = UserProfile.objects.get_or_create(
                user=superadmin_user,
                defaults={
                    'role': 'superadmin',
                    'organization': None,  # SuperAdmin sees all organizations
                    'phone': '+91-9999999991',
                    'bio': 'Platform SuperAdmin - Full access to all parties and data'
                }
            )
            credentials.append({
                'role': 'superadmin',
                'username': 'demo_superadmin',
                'password': 'Demo@12345',
                'email': 'superadmin@pulseofpeople.com',
                'description': 'Platform owner with access to all organizations',
                'permissions': 'Create any user, change roles, view all data'
            })
            self.stdout.write(self.style.SUCCESS('  ✓ SuperAdmin created'))

            # Role 2: State Admin
            self.stdout.write(self.style.MIGRATE_LABEL('  [2/7] Creating State Admin...'))
            state_admin_user, created = User.objects.get_or_create(
                username='demo_state_admin',
                defaults={
                    'email': 'state_admin@bjp.delhi.com',
                    'first_name': 'Rajesh',
                    'last_name': 'Kumar',
                    'is_active': True
                }
            )
            if created:
                state_admin_user.set_password('Demo@12345')
                state_admin_user.save()

            state_admin_profile, _ = UserProfile.objects.get_or_create(
                user=state_admin_user,
                defaults={
                    'role': 'state_admin',
                    'organization': org,
                    'assigned_state': state,
                    'created_by': superadmin_user,
                    'phone': '+91-9999999992',
                    'bio': 'State Admin for Delhi BJP - Manages entire state operations'
                }
            )
            credentials.append({
                'role': 'state_admin',
                'username': 'demo_state_admin',
                'password': 'Demo@12345',
                'email': 'state_admin@bjp.delhi.com',
                'description': 'State-level admin for Delhi',
                'permissions': 'Create zone admins, view state-wide data',
                'geography': f'State: {state.name}'
            })
            self.stdout.write(self.style.SUCCESS(f'  ✓ State Admin created (Assigned: {state.name})'))

            # Role 3: Zone Admin
            self.stdout.write(self.style.MIGRATE_LABEL('  [3/7] Creating Zone Admin...'))
            zone_admin_user, created = User.objects.get_or_create(
                username='demo_zone_admin',
                defaults={
                    'email': 'zone_admin@bjp.delhi.com',
                    'first_name': 'Amit',
                    'last_name': 'Sharma',
                    'is_active': True
                }
            )
            if created:
                zone_admin_user.set_password('Demo@12345')
                zone_admin_user.save()

            zone_admin_profile, _ = UserProfile.objects.get_or_create(
                user=zone_admin_user,
                defaults={
                    'role': 'zone_admin',
                    'organization': org,
                    'assigned_state': state,
                    'assigned_zone': zone,
                    'created_by': state_admin_user,
                    'phone': '+91-9999999993',
                    'bio': 'Zone Admin for North Delhi - Manages zonal operations'
                }
            )
            credentials.append({
                'role': 'zone_admin',
                'username': 'demo_zone_admin',
                'password': 'Demo@12345',
                'email': 'zone_admin@bjp.delhi.com',
                'description': 'Zone-level admin for North Delhi',
                'permissions': 'Create district admins, view zone-wide data',
                'geography': f'Zone: {zone.name}'
            })
            self.stdout.write(self.style.SUCCESS(f'  ✓ Zone Admin created (Assigned: {zone.name})'))

            # Role 4: District Admin
            self.stdout.write(self.style.MIGRATE_LABEL('  [4/7] Creating District Admin...'))
            district_admin_user, created = User.objects.get_or_create(
                username='demo_district_admin',
                defaults={
                    'email': 'district_admin@bjp.delhi.com',
                    'first_name': 'Vikram',
                    'last_name': 'Singh',
                    'is_active': True
                }
            )
            if created:
                district_admin_user.set_password('Demo@12345')
                district_admin_user.save()

            district_admin_profile, _ = UserProfile.objects.get_or_create(
                user=district_admin_user,
                defaults={
                    'role': 'district_admin',
                    'organization': org,
                    'assigned_state': state,
                    'assigned_zone': zone,
                    'assigned_district': district,
                    'created_by': zone_admin_user,
                    'phone': '+91-9999999994',
                    'bio': 'District Admin - Manages district-level operations'
                }
            )
            credentials.append({
                'role': 'district_admin',
                'username': 'demo_district_admin',
                'password': 'Demo@12345',
                'email': 'district_admin@bjp.delhi.com',
                'description': 'District-level admin',
                'permissions': 'Create constituency admins, view district data',
                'geography': f'District: {district.name}'
            })
            self.stdout.write(self.style.SUCCESS(f'  ✓ District Admin created (Assigned: {district.name})'))

            # Role 5: Constituency Admin
            self.stdout.write(self.style.MIGRATE_LABEL('  [5/7] Creating Constituency Admin...'))
            constituency_admin_user, created = User.objects.get_or_create(
                username='demo_constituency_admin',
                defaults={
                    'email': 'constituency_admin@bjp.delhi.com',
                    'first_name': 'Priya',
                    'last_name': 'Gupta',
                    'is_active': True
                }
            )
            if created:
                constituency_admin_user.set_password('Demo@12345')
                constituency_admin_user.save()

            constituency_admin_profile, _ = UserProfile.objects.get_or_create(
                user=constituency_admin_user,
                defaults={
                    'role': 'constituency_admin',
                    'organization': org,
                    'assigned_state': state,
                    'assigned_zone': zone,
                    'assigned_district': district,
                    'assigned_constituency': constituency,
                    'created_by': district_admin_user,
                    'phone': '+91-9999999995',
                    'bio': 'Constituency Admin - Manages constituency campaigns'
                }
            )
            credentials.append({
                'role': 'constituency_admin',
                'username': 'demo_constituency_admin',
                'password': 'Demo@12345',
                'email': 'constituency_admin@bjp.delhi.com',
                'description': 'Constituency-level admin',
                'permissions': 'Create booth admins, manage constituency data',
                'geography': f'Constituency: {constituency.name}'
            })
            self.stdout.write(self.style.SUCCESS(f'  ✓ Constituency Admin created (Assigned: {constituency.name})'))

            # Role 6: Booth Admin
            self.stdout.write(self.style.MIGRATE_LABEL('  [6/7] Creating Booth Admin...'))
            booth_admin_user, created = User.objects.get_or_create(
                username='demo_booth_admin',
                defaults={
                    'email': 'booth_admin@bjp.delhi.com',
                    'first_name': 'Rahul',
                    'last_name': 'Verma',
                    'is_active': True
                }
            )
            if created:
                booth_admin_user.set_password('Demo@12345')
                booth_admin_user.save()

            booth_admin_profile, _ = UserProfile.objects.get_or_create(
                user=booth_admin_user,
                defaults={
                    'role': 'booth_admin',
                    'organization': org,
                    'assigned_state': state,
                    'assigned_zone': zone,
                    'assigned_district': district,
                    'assigned_constituency': constituency,
                    'assigned_booth': booth,
                    'created_by': constituency_admin_user,
                    'phone': '+91-9999999996',
                    'bio': 'Booth Admin - Ground-level field agent'
                }
            )
            credentials.append({
                'role': 'booth_admin',
                'username': 'demo_booth_admin',
                'password': 'Demo@12345',
                'email': 'booth_admin@bjp.delhi.com',
                'description': 'Booth-level field agent',
                'permissions': 'Create analysts, manage booth voter data',
                'geography': f'Booth: #{booth.booth_number} - {booth.name}'
            })
            self.stdout.write(self.style.SUCCESS(f'  ✓ Booth Admin created (Assigned: Booth #{booth.booth_number})'))

            # Role 7: Analyst (War Room Observer)
            self.stdout.write(self.style.MIGRATE_LABEL('  [7/7] Creating Analyst...'))
            analyst_user, created = User.objects.get_or_create(
                username='demo_analyst',
                defaults={
                    'email': 'analyst@bjp.delhi.com',
                    'first_name': 'Sneha',
                    'last_name': 'Reddy',
                    'is_active': True
                }
            )
            if created:
                analyst_user.set_password('Demo@12345')
                analyst_user.save()

            analyst_profile, _ = UserProfile.objects.get_or_create(
                user=analyst_user,
                defaults={
                    'role': 'analyst',
                    'organization': org,
                    'assigned_state': state,
                    'assigned_zone': zone,
                    'assigned_district': district,
                    'assigned_constituency': constituency,
                    'assigned_booth': booth,
                    'created_by': booth_admin_user,
                    'phone': '+91-9999999997',
                    'bio': 'Analyst - Read-only war room observer'
                }
            )
            credentials.append({
                'role': 'analyst',
                'username': 'demo_analyst',
                'password': 'Demo@12345',
                'email': 'analyst@bjp.delhi.com',
                'description': 'Read-only analyst/observer',
                'permissions': 'View data only, no creation or modification',
                'geography': f'Assigned to: {booth.name}'
            })
            self.stdout.write(self.style.SUCCESS('  ✓ Analyst created (Read-only access)'))

            # Step 4: Save credentials to JSON file
            self.stdout.write('\n4. Saving credentials...')
            credentials_file = 'test_credentials.json'
            with open(credentials_file, 'w') as f:
                json.dump({
                    'organization': {
                        'name': org.name,
                        'party': org.party_name,
                        'slug': org.slug
                    },
                    'geography': {
                        'state': state.name,
                        'zone': zone.name,
                        'district': district.name,
                        'constituency': constituency.name,
                        'booth': f'Booth #{booth.booth_number}'
                    },
                    'users': credentials,
                    'common_password': 'Demo@12345',
                    'api_base_url': 'http://localhost:8000/api',
                    'test_note': 'All demo users have the same password: Demo@12345'
                }, f, indent=2)

            self.stdout.write(self.style.SUCCESS(f'  ✓ Credentials saved to {credentials_file}'))

        # Summary
        self.stdout.write(self.style.MIGRATE_HEADING('\n=== Demo Users Created Successfully ===\n'))
        self.stdout.write(self.style.SUCCESS(f'Organization: {org.party_name} ({org.name})'))
        self.stdout.write(self.style.SUCCESS(f'Total Users: {len(credentials)}'))
        self.stdout.write(self.style.SUCCESS(f'Common Password: Demo@12345'))
        self.stdout.write(self.style.SUCCESS(f'Credentials File: test_credentials.json'))

        self.stdout.write('\n' + self.style.MIGRATE_LABEL('User Hierarchy:'))
        self.stdout.write('  1. SuperAdmin → (Platform Owner)')
        self.stdout.write('  2. State Admin → (Created by SuperAdmin)')
        self.stdout.write('  3. Zone Admin → (Created by State Admin)')
        self.stdout.write('  4. District Admin → (Created by Zone Admin)')
        self.stdout.write('  5. Constituency Admin → (Created by District Admin)')
        self.stdout.write('  6. Booth Admin → (Created by Constituency Admin)')
        self.stdout.write('  7. Analyst → (Created by Booth Admin)')

        self.stdout.write('\n' + self.style.WARNING('Next Steps:'))
        self.stdout.write('  - Run: python manage.py test_role_dashboards.py')
        self.stdout.write('  - Or login at: http://localhost:8000/api/auth/login/')
        self.stdout.write('  - Use credentials from test_credentials.json\n')
