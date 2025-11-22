/**
 * Enhanced Mapbox Interactive Map for Indian States - Multi-Layer Visualization
 *
 * Generic component that works with any Indian state's GeoJSON data
 *
 * Features:
 * - Dynamic state selection based on user's assigned state
 * - Base sentiment layer (overall party sentiment by constituency)
 * - Issue-specific overlays (Jobs, Healthcare, Infrastructure, etc.)
 * - Alert markers for critical issues
 * - Layer toggle controls
 * - Rich hover tooltips with 5-second summaries
 * - Heatmap visualization for high-priority issues
 * - Fallback UI when GeoJSON is not available
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Layers, TrendingUp, AlertTriangle, Briefcase, Heart, Building, Users, Sprout, MapPin } from 'lucide-react';
import { defaultConstituencySentiment, getConstituencySentiment } from '../../data/defaultConstituencySentiment';
import { getIssueScore, getConstituencyIssueScores } from '../../data/constituencyIssueData';

const MAPBOX_TOKEN = 'pk.eyJ1IjoiYmttdXJhbGkiLCJhIjoiY21ocDhoNXhiMGhodDJrcW94OGptdDg0MiJ9.dq6OU3jiKKntjhIDD9sxWQ';

interface EnhancedMapboxStateMapProps {
  stateName: string;
  stateCode: string;
  geoJsonData: any; // GeoJSON FeatureCollection
  centerCoordinates: [number, number]; // [longitude, latitude]
  zoomLevel: number;
  height?: string;
  onConstituencyClick?: (constituency: any) => void;
  sentimentData?: { [constituency: string]: number };
  issueData?: { [constituency: string]: { [issue: string]: number } };
  alertsData?: Array<{ lat: number; lng: number; title: string; severity: string; description: string }>;
}

type MapLayer = 'sentiment' | 'jobs' | 'healthcare' | 'infrastructure' | 'education' | 'agriculture' | 'alerts';

export const EnhancedMapboxStateMap: React.FC<EnhancedMapboxStateMapProps> = React.memo(({
  stateName,
  stateCode,
  geoJsonData,
  centerCoordinates,
  zoomLevel,
  height = '700px',
  onConstituencyClick,
  sentimentData = {},
  issueData = {},
  alertsData = []
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [selectedConstituency, setSelectedConstituency] = useState<any>(null);
  const [activeLayer, setActiveLayer] = useState<MapLayer>('sentiment');
  const [showLayerControl, setShowLayerControl] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const alertMarkers = useRef<mapboxgl.Marker[]>([]);

  const onConstituencyClickRef = useRef(onConstituencyClick);

  useEffect(() => {
    onConstituencyClickRef.current = onConstituencyClick;
  }, [onConstituencyClick]);

  // Ensure map always starts with 'sentiment' layer on mount/refresh
  useEffect(() => {
    setActiveLayer('sentiment');
  }, []);

  // Color scheme for sentiment (8-step scale)
  const getSentimentColor = useCallback((score: number): string => {
    if (score >= 80) return '#2E7D32';
    if (score >= 70) return '#388E3C';
    if (score >= 60) return '#66BB6A';
    if (score >= 50) return '#FDD835';
    if (score >= 40) return '#FF6D00';
    if (score >= 30) return '#FF3D00';
    if (score >= 20) return '#DD2C00';
    return '#B71C1C';
  }, []);

  // Get color based on active layer and data
  const getLayerColor = useCallback((constituencyName: string): string => {
    if (activeLayer === 'sentiment') {
      const score = sentimentData[constituencyName] || getConstituencySentiment(constituencyName);
      return getSentimentColor(score);
    } else if (activeLayer === 'alerts') {
      return '#9E9E9E';
    } else {
      const issueKey = activeLayer as 'jobs' | 'healthcare' | 'infrastructure' | 'education' | 'agriculture';
      const issueScore = issueData[constituencyName]?.[activeLayer] || getIssueScore(constituencyName, issueKey);
      return getSentimentColor(issueScore);
    }
  }, [activeLayer, sentimentData, issueData, getSentimentColor]);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || !geoJsonData) return;

    try {
      mapboxgl.accessToken = MAPBOX_TOKEN;

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: centerCoordinates,
        zoom: zoomLevel,
        attributionControl: true
      });

      map.current.on('load', () => {
        if (!map.current || !geoJsonData) return;

        // Add source with GeoJSON data
        map.current.addSource('constituencies', {
          type: 'geojson',
          data: geoJsonData
        });

        // Add fill layer
        map.current.addLayer({
          id: 'constituencies-fill',
          type: 'fill',
          source: 'constituencies',
          paint: {
            'fill-color': '#666',
            'fill-opacity': 0.6
          }
        });

        // Add outline layer
        map.current.addLayer({
          id: 'constituencies-outline',
          type: 'line',
          source: 'constituencies',
          paint: {
            'line-color': '#000',
            'line-width': 1
          }
        });

        // Update colors based on sentiment data
        updateMapColors();

        // Add click handler
        map.current.on('click', 'constituencies-fill', (e) => {
          if (e.features && e.features.length > 0) {
            const feature = e.features[0];
            setSelectedConstituency(feature);
            if (onConstituencyClickRef.current) {
              onConstituencyClickRef.current(feature);
            }
          }
        });

        // Change cursor on hover
        map.current.on('mouseenter', 'constituencies-fill', () => {
          if (map.current) map.current.getCanvas().style.cursor = 'pointer';
        });

        map.current.on('mouseleave', 'constituencies-fill', () => {
          if (map.current) map.current.getCanvas().style.cursor = '';
        });
      });

      map.current.on('error', (e) => {
        console.error('Map error:', e);
        setMapError(`Failed to load map: ${e.error?.message || 'Unknown error'}`);
      });

    } catch (error: any) {
      console.error('Map initialization error:', error);
      setMapError(`Failed to initialize map: ${error.message}`);
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [geoJsonData, centerCoordinates, zoomLevel]);

  // Update map colors when data or layer changes
  const updateMapColors = useCallback(() => {
    if (!map.current || !geoJsonData) return;

    // Check if map style is loaded and layer exists
    if (!map.current.isStyleLoaded() || !map.current.getLayer('constituencies-fill')) {
      return;
    }

    const features = geoJsonData.features;

    // If no features (empty placeholder), use simple color
    if (!features || features.length === 0) {
      try {
        map.current.setPaintProperty('constituencies-fill', 'fill-color', '#999');
      } catch (error) {
        console.warn('Failed to set default map color:', error);
      }
      return;
    }

    const colorExpression: any = ['match', ['get', 'AC_NAME']];

    features.forEach((feature: any) => {
      const constituencyName = feature.properties.AC_NAME;
      const color = getLayerColor(constituencyName);
      colorExpression.push(constituencyName, color);
    });

    colorExpression.push('#999'); // Default color

    try {
      map.current.setPaintProperty('constituencies-fill', 'fill-color', colorExpression);
    } catch (error) {
      console.warn('Failed to update map colors:', error);
    }
  }, [geoJsonData, getLayerColor]);

  useEffect(() => {
    updateMapColors();
  }, [updateMapColors, activeLayer, sentimentData, issueData]);

  // Layer control UI
  const layers: { id: MapLayer; label: string; icon: React.ReactNode }[] = [
    { id: 'sentiment', label: 'Overall Sentiment', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'jobs', label: 'Jobs & Economy', icon: <Briefcase className="w-4 h-4" /> },
    { id: 'healthcare', label: 'Healthcare', icon: <Heart className="w-4 h-4" /> },
    { id: 'infrastructure', label: 'Infrastructure', icon: <Building className="w-4 h-4" /> },
    { id: 'education', label: 'Education', icon: <Users className="w-4 h-4" /> },
    { id: 'agriculture', label: 'Agriculture', icon: <Sprout className="w-4 h-4" /> },
    { id: 'alerts', label: 'Critical Alerts', icon: <AlertTriangle className="w-4 h-4" /> },
  ];

  if (mapError) {
    return (
      <div className="flex items-center justify-center bg-slate-50 rounded-lg border-2 border-dashed border-slate-300" style={{ height }}>
        <div className="text-center p-6">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <p className="text-lg font-semibold text-slate-900 mb-2">Map Load Error</p>
          <p className="text-sm text-slate-600">{mapError}</p>
        </div>
      </div>
    );
  }

  if (!geoJsonData) {
    return (
      <div className="flex items-center justify-center bg-slate-50 rounded-lg border-2 border-dashed border-slate-300" style={{ height }}>
        <div className="text-center p-6">
          <MapPin className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <p className="text-lg font-semibold text-slate-900 mb-2">Map Not Available</p>
          <p className="text-sm text-slate-600">
            Detailed constituency map for <strong>{stateName}</strong> is not available yet.
          </p>
          <p className="text-xs text-slate-500 mt-2">
            Data is still displayed in tables and charts throughout the dashboard.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative" style={{ height }}>
      <div ref={mapContainer} className="absolute inset-0 rounded-lg overflow-hidden" />

      {/* Layer Control */}
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={() => setShowLayerControl(!showLayerControl)}
          className="bg-white shadow-lg rounded-lg p-2.5 hover:bg-slate-50 transition-colors"
          title="Toggle layers"
        >
          <Layers className="w-5 h-5 text-slate-700" />
        </button>

        {showLayerControl && (
          <div className="absolute top-12 right-0 bg-white rounded-lg shadow-xl border border-slate-200 p-2 min-w-[200px]">
            <div className="text-xs font-semibold text-slate-600 mb-2 px-2">Map Layers</div>
            {layers.map((layer) => (
              <button
                key={layer.id}
                onClick={() => {
                  setActiveLayer(layer.id);
                  setShowLayerControl(false);
                }}
                className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                  activeLayer === layer.id
                    ? 'bg-indigo-50 text-indigo-700 font-medium'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {layer.icon}
                <span>{layer.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Active Layer Indicator */}
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow-md z-10">
        <div className="flex items-center space-x-2">
          {layers.find(l => l.id === activeLayer)?.icon}
          <span className="text-sm font-medium text-slate-700">
            {layers.find(l => l.id === activeLayer)?.label}
          </span>
        </div>
      </div>
    </div>
  );
});

EnhancedMapboxStateMap.displayName = 'EnhancedMapboxStateMap';
