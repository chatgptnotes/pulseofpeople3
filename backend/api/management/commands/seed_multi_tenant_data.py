"""
Management command to seed multi-tenant organizations with complete branding
Creates BJP, TVK, and Demo tenants with full configurations
"""
from django.core.management.base import BaseCommand
from api.models import Organization


class Command(BaseCommand):
    help = 'Seed multi-tenant organizations with complete branding configurations'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('🚀 Starting multi-tenant data seeding...'))
        self.stdout.write('')

        # Tenant configurations
        tenants = [
            {
                'name': 'Bharatiya Janata Party',
                'slug': 'bjp',
                'subdomain': 'bjp',
                'organization_type': 'party',
                'logo': '/logos/bjp-logo.png',
                'is_public': True,
                'allow_registration': True,

                # Contact Info
                'contact_email': 'contact@bjp.org',
                'contact_phone': '+91-11-23034486',
                'address': '6A, Deen Dayal Upadhyay Marg',
                'city': 'New Delhi',
                'state': 'Delhi',
                'website': 'https://www.bjp.org',
                'social_media_links': {
                    'twitter': 'https://twitter.com/BJP4India',
                    'facebook': 'https://www.facebook.com/BJPIndia',
                    'instagram': 'https://www.instagram.com/bjp4india',
                    'youtube': 'https://www.youtube.com/user/BJPLive'
                },

                # Party Info
                'party_name': 'Bharatiya Janata Party',
                'party_symbol': 'Lotus',
                'party_color': '#FF9933',

                # Subscription
                'subscription_status': 'active',
                'subscription_tier': 'enterprise',
                'max_users': 1000,

                # Branding Configuration
                'branding': {
                    'primary_color': '#FF9933',      # Saffron
                    'secondary_color': '#138808',    # Green
                    'accent_color': '#FFFFFF',       # White
                    'header_bg_color': '#FF9933',
                    'footer_bg_color': '#138808',
                    'button_bg_color': '#FF9933',
                    'logo_url': '/logos/bjp-logo.png',
                    'favicon_url': '/logos/bjp-favicon.ico',
                    'font_family': 'Poppins, sans-serif',
                    'custom_css': '''
                        .hero-section {
                            background: linear-gradient(135deg, #FF9933 0%, #138808 100%);
                        }
                        .card {
                            border-color: #FF9933;
                        }
                    '''
                },

                # Landing Page Config
                'landing_page_config': {
                    'hero_title': 'सबका साथ, सबका विकास, सबका विश्वास',
                    'hero_subtitle': 'Building a Strong and Prosperous India',
                    'hero_cta_text': 'Join the Movement',
                    'hero_cta_link': '/register',
                    'hero_image': '/images/bjp-hero.jpg',

                    'features': [
                        {
                            'title': 'Nationalism First',
                            'description': 'Committed to national security and sovereignty',
                            'icon': 'flag'
                        },
                        {
                            'title': 'Economic Development',
                            'description': 'Focus on growth, infrastructure, and employment',
                            'icon': 'trending_up'
                        },
                        {
                            'title': 'Digital India',
                            'description': 'Embracing technology for governance and services',
                            'icon': 'devices'
                        },
                        {
                            'title': 'Social Welfare',
                            'description': 'Schemes for farmers, women, and marginalized communities',
                            'icon': 'people'
                        }
                    ],

                    'stats': [
                        {'label': 'Members', 'value': '180M+'},
                        {'label': 'States Governed', 'value': '12'},
                        {'label': 'Years of Service', 'value': '43+'},
                        {'label': 'Achievements', 'value': '100+'}
                    ],

                    'testimonials': [
                        {
                            'name': 'Ramesh Kumar',
                            'role': 'Farmer',
                            'quote': 'PM-KISAN scheme has transformed my farming business.',
                            'avatar': '/avatars/default-male.jpg'
                        },
                        {
                            'name': 'Priya Sharma',
                            'role': 'Entrepreneur',
                            'quote': 'Startup India initiative helped me launch my dream business.',
                            'avatar': '/avatars/default-female.jpg'
                        }
                    ],

                    'about': {
                        'title': 'About BJP',
                        'content': 'The Bharatiya Janata Party is one of two major political parties in India, founded in 1980. With a focus on cultural nationalism and economic liberalization, BJP has grown to become the largest political party in the world by membership.'
                    }
                },

                # Theme Config
                'theme_config': {
                    'border_radius': '8px',
                    'spacing_unit': '8px',
                    'card_shadow': '0 2px 8px rgba(255,153,51,0.15)',
                    'button_style': 'rounded'
                },

                # SEO Config
                'seo_config': {
                    'title': 'BJP - Bharatiya Janata Party | Official Website',
                    'description': 'Join Indias largest political party committed to national development, security, and prosperity.',
                    'keywords': 'BJP, Bharatiya Janata Party, Indian politics, Modi, nationalism',
                    'og_image': '/images/bjp-og.jpg'
                },

                # Feature Flags
                'features_enabled': {
                    'show_news': True,
                    'show_events': True,
                    'show_donations': True,
                    'show_volunteer_signup': True,
                    'show_feedback': True
                },

                'is_active': True
            },

            {
                'name': 'Tamilaga Vettri Kazhagam',
                'slug': 'tvk',
                'subdomain': 'tvk',
                'organization_type': 'party',
                'logo': '/logos/tvk-logo.png',
                'is_public': True,
                'allow_registration': True,

                # Contact Info
                'contact_email': 'contact@tvk.org',
                'contact_phone': '+91-44-12345678',
                'address': 'Panaiyur, Chennai',
                'city': 'Chennai',
                'state': 'Tamil Nadu',
                'website': 'https://www.tvk.org',
                'social_media_links': {
                    'twitter': 'https://twitter.com/ikamalhaasan',
                    'facebook': 'https://www.facebook.com/ikamalhaasan',
                    'instagram': 'https://www.instagram.com/ikamalhaasan'
                },

                # Party Info
                'party_name': 'Tamilaga Vettri Kazhagam',
                'party_symbol': 'Battery Torch',
                'party_color': '#FFD700',

                # Subscription
                'subscription_status': 'active',
                'subscription_tier': 'pro',
                'max_users': 500,

                # Branding Configuration
                'branding': {
                    'primary_color': '#FFD700',      # Gold
                    'secondary_color': '#DC143C',    # Crimson Red
                    'accent_color': '#000000',       # Black
                    'header_bg_color': '#FFD700',
                    'footer_bg_color': '#DC143C',
                    'button_bg_color': '#FFD700',
                    'logo_url': '/logos/tvk-logo.png',
                    'favicon_url': '/logos/tvk-favicon.ico',
                    'font_family': 'Roboto, sans-serif',
                    'custom_css': '''
                        .hero-section {
                            background: linear-gradient(135deg, #FFD700 0%, #DC143C 100%);
                        }
                        .card {
                            border-color: #FFD700;
                        }
                    '''
                },

                # Landing Page Config
                'landing_page_config': {
                    'hero_title': 'வெற்றி தமிழகத்தின் வெற்றி',
                    'hero_subtitle': 'Victory for Tamil Nadu',
                    'hero_cta_text': 'Join TVK',
                    'hero_cta_link': '/register',
                    'hero_image': '/images/tvk-hero.jpg',

                    'features': [
                        {
                            'title': 'Tamil Pride',
                            'description': 'Upholding Tamil culture, language, and heritage',
                            'icon': 'star'
                        },
                        {
                            'title': 'Social Justice',
                            'description': 'Equality, education, and empowerment for all',
                            'icon': 'balance'
                        },
                        {
                            'title': 'Economic Progress',
                            'description': 'Employment, industry, and infrastructure development',
                            'icon': 'trending_up'
                        },
                        {
                            'title': 'Transparent Governance',
                            'description': 'Accountability and citizen participation',
                            'icon': 'visibility'
                        }
                    ],

                    'stats': [
                        {'label': 'Members', 'value': '5L+'},
                        {'label': 'Districts', 'value': '38'},
                        {'label': 'Founded', 'value': '2021'},
                        {'label': 'Volunteers', 'value': '10K+'}
                    ],

                    'testimonials': [
                        {
                            'name': 'Murugan Selvam',
                            'role': 'Teacher',
                            'quote': 'TVK represents hope for a progressive Tamil Nadu.',
                            'avatar': '/avatars/default-male.jpg'
                        },
                        {
                            'name': 'Lakshmi Devi',
                            'role': 'Social Worker',
                            'quote': 'Their vision for social justice resonates with me.',
                            'avatar': '/avatars/default-female.jpg'
                        }
                    ],

                    'about': {
                        'title': 'About TVK',
                        'content': 'Tamilaga Vettri Kazhagam (TVK) is a political party founded by actor-turned-politician Kamal Haasan in 2021. The party aims to bring progressive change to Tamil Nadu through transparency, social justice, and inclusive development.'
                    }
                },

                # Theme Config
                'theme_config': {
                    'border_radius': '12px',
                    'spacing_unit': '8px',
                    'card_shadow': '0 4px 12px rgba(255,215,0,0.2)',
                    'button_style': 'rounded'
                },

                # SEO Config
                'seo_config': {
                    'title': 'TVK - Tamilaga Vettri Kazhagam | Official Website',
                    'description': 'Join TVK for progressive change in Tamil Nadu. Social justice, transparency, and development.',
                    'keywords': 'TVK, Tamilaga Vettri Kazhagam, Tamil Nadu politics, Kamal Haasan',
                    'og_image': '/images/tvk-og.jpg'
                },

                # Feature Flags
                'features_enabled': {
                    'show_news': True,
                    'show_events': True,
                    'show_donations': True,
                    'show_volunteer_signup': True,
                    'show_feedback': True
                },

                'is_active': True
            },

            {
                'name': 'Demo Organization',
                'slug': 'demo',
                'subdomain': 'demo',
                'organization_type': 'campaign',
                'logo': '/logos/demo-logo.png',
                'is_public': True,
                'allow_registration': True,

                # Contact Info
                'contact_email': 'demo@pulseofpeople.com',
                'contact_phone': '+91-1234567890',
                'address': 'Demo Address',
                'city': 'Demo City',
                'state': 'Demo State',
                'website': 'https://demo.pulseofpeople.com',
                'social_media_links': {},

                # Party Info
                'party_name': 'Demo Party',
                'party_symbol': 'Star',
                'party_color': '#1976D2',

                # Subscription
                'subscription_status': 'active',
                'subscription_tier': 'basic',
                'max_users': 50,

                # Branding Configuration
                'branding': {
                    'primary_color': '#1976D2',
                    'secondary_color': '#424242',
                    'accent_color': '#FF9800',
                    'header_bg_color': '#1976D2',
                    'footer_bg_color': '#424242',
                    'button_bg_color': '#1976D2',
                    'logo_url': '/logos/demo-logo.png',
                    'favicon_url': '/favicon.ico',
                    'font_family': 'Roboto, sans-serif'
                },

                # Landing Page Config
                'landing_page_config': {
                    'hero_title': 'Welcome to Demo Organization',
                    'hero_subtitle': 'This is a demonstration tenant',
                    'hero_cta_text': 'Get Started',
                    'hero_cta_link': '/register',

                    'features': [
                        {
                            'title': 'Feature One',
                            'description': 'Description of feature one',
                            'icon': 'star'
                        },
                        {
                            'title': 'Feature Two',
                            'description': 'Description of feature two',
                            'icon': 'settings'
                        }
                    ],

                    'stats': [
                        {'label': 'Users', 'value': '100+'},
                        {'label': 'Projects', 'value': '10'}
                    ]
                },

                # Theme Config
                'theme_config': {
                    'border_radius': '8px',
                    'spacing_unit': '8px',
                    'button_style': 'rounded'
                },

                # SEO Config
                'seo_config': {
                    'title': 'Demo Organization - Pulse of People',
                    'description': 'Demo organization for testing multi-tenant features',
                    'keywords': 'demo, multi-tenant, testing'
                },

                # Feature Flags
                'features_enabled': {
                    'show_news': True,
                    'show_events': True,
                    'show_donations': False,
                    'show_volunteer_signup': True,
                    'show_feedback': True
                },

                'is_active': True
            }
        ]

        # Create or update each tenant
        created_count = 0
        updated_count = 0

        for tenant_data in tenants:
            subdomain = tenant_data['subdomain']

            # Check if tenant already exists
            existing_tenant = Organization.objects.filter(subdomain=subdomain).first()

            if existing_tenant:
                # Update existing tenant
                for key, value in tenant_data.items():
                    setattr(existing_tenant, key, value)
                existing_tenant.save()
                updated_count += 1
                self.stdout.write(
                    self.style.WARNING(f'✏️  Updated: {tenant_data["name"]} (subdomain: {subdomain})')
                )
            else:
                # Create new tenant
                Organization.objects.create(**tenant_data)
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'✅ Created: {tenant_data["name"]} (subdomain: {subdomain})')
                )

        # Summary
        self.stdout.write('')
        self.stdout.write(self.style.SUCCESS('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'))
        self.stdout.write(self.style.SUCCESS(f'📊 Summary:'))
        self.stdout.write(f'   ✅ Created: {created_count} tenants')
        self.stdout.write(f'   ✏️  Updated: {updated_count} tenants')
        self.stdout.write('')
        self.stdout.write(self.style.SUCCESS('🎉 Multi-tenant data seeding completed!'))
        self.stdout.write('')
        self.stdout.write('🌐 You can now access:')
        self.stdout.write('   • http://bjp.localhost:5173 (BJP branding)')
        self.stdout.write('   • http://tvk.localhost:5173 (TVK branding)')
        self.stdout.write('   • http://demo.localhost:5173 (Demo branding)')
        self.stdout.write('')
        self.stdout.write('⚠️  Note: Make sure to add these to /etc/hosts first:')
        self.stdout.write('   127.0.0.1 bjp.localhost')
        self.stdout.write('   127.0.0.1 tvk.localhost')
        self.stdout.write('   127.0.0.1 demo.localhost')
        self.stdout.write('')
