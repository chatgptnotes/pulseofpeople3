"""
State Configuration API Views
Provides dynamic state configuration for frontend map system
"""

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from api.models import State


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_states_config(request):
    """
    Get all states with their map configuration

    Returns:
        {
            "states": [
                {
                    "id": "uuid",
                    "name": "Tamil Nadu",
                    "code": "TN",
                    "center_lat": 11.1271,
                    "center_lng": 78.6569,
                    "zoom_level": 6.5,
                    "has_geojson": true,
                    "constituencies_count": 234
                },
                ...
            ]
        }
    """
    states = State.objects.all().order_by('name')

    states_data = []
    for state in states:
        # Count constituencies for this state
        constituencies_count = state.constituencies.count() if hasattr(state, 'constituencies') else 0

        states_data.append({
            'id': str(state.id),
            'name': state.name,
            'code': state.code,
            'center_lat': float(state.center_lat) if state.center_lat else None,
            'center_lng': float(state.center_lng) if state.center_lng else None,
            'zoom_level': float(state.zoom_level),
            'has_geojson': state.has_geojson,
            'constituencies_count': constituencies_count,
        })

    return Response({'states': states_data})
