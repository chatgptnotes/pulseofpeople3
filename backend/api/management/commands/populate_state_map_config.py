"""
Management command to populate State model with map configuration data
Usage: python manage.py populate_state_map_config
"""

from django.core.management.base import BaseCommand
from django.db import transaction
from api.models import State
from decimal import Decimal


class Command(BaseCommand):
    help = 'Populate State model with map configuration (coordinates, zoom, GeoJSON availability)'

    # Map configuration data for all 10 major Indian states
    STATE_MAP_CONFIG = {
        'TN': {
            'name': 'Tamil Nadu',
            'center_lat': Decimal('11.1271'),
            'center_lng': Decimal('78.6569'),
            'zoom_level': Decimal('6.5'),
            'has_geojson': True,  # Tamil Nadu GeoJSON exists
        },
        'MH': {
            'name': 'Maharashtra',
            'center_lat': Decimal('19.7515'),
            'center_lng': Decimal('75.7139'),
            'zoom_level': Decimal('6.0'),
            'has_geojson': False,  # Set to True after adding GeoJSON file
        },
        'DL': {
            'name': 'Delhi',
            'center_lat': Decimal('28.7041'),
            'center_lng': Decimal('77.1025'),
            'zoom_level': Decimal('10.0'),
            'has_geojson': False,
        },
        'PB': {
            'name': 'Punjab',
            'center_lat': Decimal('31.1471'),
            'center_lng': Decimal('75.3412'),
            'zoom_level': Decimal('7.0'),
            'has_geojson': False,
        },
        'UP': {
            'name': 'Uttar Pradesh',
            'center_lat': Decimal('26.8467'),
            'center_lng': Decimal('80.9462'),
            'zoom_level': Decimal('6.0'),
            'has_geojson': False,
        },
        'KA': {
            'name': 'Karnataka',
            'center_lat': Decimal('15.3173'),
            'center_lng': Decimal('76.6394'),
            'zoom_level': Decimal('6.5'),
            'has_geojson': False,
        },
        'GJ': {
            'name': 'Gujarat',
            'center_lat': Decimal('22.2587'),
            'center_lng': Decimal('71.1924'),
            'zoom_level': Decimal('6.5'),
            'has_geojson': False,
        },
        'WB': {
            'name': 'West Bengal',
            'center_lat': Decimal('22.9868'),
            'center_lng': Decimal('87.8550'),
            'zoom_level': Decimal('7.0'),
            'has_geojson': False,
        },
        'RJ': {
            'name': 'Rajasthan',
            'center_lat': Decimal('27.0238'),
            'center_lng': Decimal('74.2179'),
            'zoom_level': Decimal('6.0'),
            'has_geojson': False,
        },
        'MP': {
            'name': 'Madhya Pradesh',
            'center_lat': Decimal('22.9734'),
            'center_lng': Decimal('78.6569'),
            'zoom_level': Decimal('6.0'),
            'has_geojson': False,
        },
    }

    def add_arguments(self, parser):
        parser.add_argument(
            '--create-missing',
            action='store_true',
            help='Create states that do not exist in database',
        )
        parser.add_argument(
            '--overwrite',
            action='store_true',
            help='Overwrite existing map configuration (default: only update if null)',
        )

    @transaction.atomic
    def handle(self, *args, **options):
        create_missing = options['create_missing']
        overwrite = options['overwrite']

        self.stdout.write(self.style.SUCCESS('\n=== Populating State Map Configuration ===\n'))

        updated_count = 0
        created_count = 0
        skipped_count = 0

        for code, config in self.STATE_MAP_CONFIG.items():
            try:
                # Try to get existing state
                try:
                    state = State.objects.get(code=code)
                    state_exists = True
                except State.DoesNotExist:
                    state_exists = False
                    state = State(code=code, name=config['name'])

                # If state doesn't exist and we're not creating, skip
                if not state_exists and not create_missing:
                    self.stdout.write(
                        self.style.WARNING(f'  ⚠ {code} ({config["name"]}): Not found (use --create-missing)')
                    )
                    skipped_count += 1
                    continue

                # Update or set map configuration
                needs_update = False

                if overwrite or state.center_lat is None:
                    state.center_lat = config['center_lat']
                    needs_update = True

                if overwrite or state.center_lng is None:
                    state.center_lng = config['center_lng']
                    needs_update = True

                if overwrite or state.zoom_level != config['zoom_level']:
                    state.zoom_level = config['zoom_level']
                    needs_update = True

                if overwrite or not state.has_geojson:
                    state.has_geojson = config['has_geojson']
                    needs_update = True

                if needs_update or not state_exists:
                    state.save()
                    if not state_exists:
                        created_count += 1
                        self.stdout.write(
                            self.style.SUCCESS(
                                f'  ✓ {code} ({config["name"]}): Created with map config'
                            )
                        )
                    else:
                        updated_count += 1
                        geojson_status = '✓ GeoJSON available' if config['has_geojson'] else '✗ No GeoJSON'
                        self.stdout.write(
                            self.style.SUCCESS(
                                f'  ✓ {code} ({config["name"]}): Updated - {geojson_status}'
                            )
                        )
                else:
                    skipped_count += 1
                    self.stdout.write(
                        f'  - {code} ({config["name"]}): Already configured (use --overwrite to update)'
                    )

            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f'  ✗ {code} ({config["name"]}): Error - {str(e)}')
                )

        # Summary
        self.stdout.write(self.style.SUCCESS(f'\n=== Summary ==='))
        self.stdout.write(f'  Created: {created_count}')
        self.stdout.write(f'  Updated: {updated_count}')
        self.stdout.write(f'  Skipped: {skipped_count}')
        self.stdout.write(f'  Total: {created_count + updated_count + skipped_count}\n')

        if created_count + updated_count > 0:
            self.stdout.write(
                self.style.SUCCESS(
                    '✓ State map configuration populated successfully!'
                )
            )
        else:
            self.stdout.write(
                self.style.WARNING(
                    '⚠ No states were updated. Use --create-missing or --overwrite if needed.'
                )
            )
