# Generated migration for multi-tenant branding support
# This adds all missing JSONB fields to match Supabase schema

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0010_organization_landing_page_config_and_more'),
    ]

    operations = [
        # Basic Information Fields
        migrations.AddField(
            model_name='organization',
            name='logo',
            field=models.TextField(blank=True, null=True, help_text='Logo URL'),
        ),
        migrations.AddField(
            model_name='organization',
            name='organization_type',
            field=models.CharField(
                choices=[
                    ('party', 'Political Party'),
                    ('campaign', 'Campaign'),
                    ('ngo', 'NGO'),
                    ('other', 'Other')
                ],
                default='campaign',
                help_text='Type of organization',
                max_length=20
            ),
        ),

        # Multi-Tenant Fields
        migrations.AddField(
            model_name='organization',
            name='custom_domain',
            field=models.CharField(
                blank=True,
                help_text='Custom domain for white-labeling (e.g., election.bjp.com)',
                max_length=255,
                null=True,
                unique=True
            ),
        ),
        migrations.AddField(
            model_name='organization',
            name='is_public',
            field=models.BooleanField(
                default=True,
                help_text='Whether this organization is publicly visible'
            ),
        ),
        migrations.AddField(
            model_name='organization',
            name='allow_registration',
            field=models.BooleanField(
                default=True,
                help_text='Allow users to self-register for this organization'
            ),
        ),
        migrations.AddField(
            model_name='organization',
            name='domain_verified',
            field=models.BooleanField(
                default=False,
                help_text='Whether the custom domain has been verified'
            ),
        ),

        # Contact Information
        migrations.AddField(
            model_name='organization',
            name='contact_email',
            field=models.EmailField(blank=True, max_length=254, null=True),
        ),
        migrations.AddField(
            model_name='organization',
            name='contact_phone',
            field=models.CharField(blank=True, max_length=20, null=True),
        ),
        migrations.AddField(
            model_name='organization',
            name='address',
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='organization',
            name='city',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
        migrations.AddField(
            model_name='organization',
            name='state',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
        migrations.AddField(
            model_name='organization',
            name='website',
            field=models.URLField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='organization',
            name='social_media_links',
            field=models.JSONField(
                blank=True,
                default=dict,
                help_text='Social media URLs (twitter, facebook, instagram, etc.)'
            ),
        ),

        # Subscription
        migrations.AddField(
            model_name='organization',
            name='subscription_expires_at',
            field=models.DateTimeField(blank=True, null=True),
        ),

        # Multi-Tenant Configuration JSONB Fields
        migrations.AddField(
            model_name='organization',
            name='branding',
            field=models.JSONField(
                blank=True,
                default=dict,
                help_text='Branding configuration (colors, logo, custom CSS, etc.)'
            ),
        ),
        migrations.AddField(
            model_name='organization',
            name='theme_config',
            field=models.JSONField(
                blank=True,
                default=dict,
                help_text='Theme configuration (fonts, spacing, border radius, etc.)'
            ),
        ),
        migrations.AddField(
            model_name='organization',
            name='contact_config',
            field=models.JSONField(
                blank=True,
                default=dict,
                help_text='Contact configuration for forms and support'
            ),
        ),
        migrations.AddField(
            model_name='organization',
            name='party_info',
            field=models.JSONField(
                blank=True,
                default=dict,
                help_text='Structured party information (history, manifesto, leaders, etc.)'
            ),
        ),
        migrations.AddField(
            model_name='organization',
            name='features_enabled',
            field=models.JSONField(
                blank=True,
                default=dict,
                help_text='Feature flags for enabling/disabling functionality'
            ),
        ),
        migrations.AddField(
            model_name='organization',
            name='usage_limits',
            field=models.JSONField(
                blank=True,
                default=dict,
                help_text='Resource usage limits and quotas'
            ),
        ),
        migrations.AddField(
            model_name='organization',
            name='seo_config',
            field=models.JSONField(
                blank=True,
                default=dict,
                help_text='SEO metadata (title, description, keywords, OG tags)'
            ),
        ),

        # Settings
        migrations.AddField(
            model_name='organization',
            name='is_active',
            field=models.BooleanField(
                default=True,
                help_text='Whether this organization is active'
            ),
        ),
    ]
