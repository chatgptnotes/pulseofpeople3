import { useState, useEffect, useCallback } from 'react';
import type { StateMapConfig } from '../config/states-config';

const API_BASE_URL = import.meta.env.VITE_DJANGO_API_URL || 'http://127.0.0.1:8000/api';

// Token management
const getAccessToken = () => localStorage.getItem('pulseofpeople_access_token');

interface StateApiResponse {
  id: string;
  name: string;
  code: string;
  center_lat: number | null;
  center_lng: number | null;
  zoom_level: number;
  has_geojson: boolean;
  constituencies_count: number;
}

interface StatesApiResponse {
  states: StateApiResponse[];
}

interface UseStatesConfigReturn {
  states: Record<string, StateMapConfig>;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  getStateByCode: (code: string) => StateMapConfig | null;
  getStateByName: (name: string) => StateMapConfig | null;
}

/**
 * Hook to fetch states configuration from the database API
 * Replaces static states-config.ts with dynamic database-driven system
 */
export function useStatesConfig(): UseStatesConfigReturn {
  const [states, setStates] = useState<Record<string, StateMapConfig>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Transform API response to StateMapConfig format
   */
  const transformStateData = (apiState: StateApiResponse): StateMapConfig => {
    // Default coordinates if not set in database
    const defaultLat = apiState.center_lat || 20.5937;
    const defaultLng = apiState.center_lng || 78.9629;
    const defaultZoom = apiState.zoom_level || 6.5;

    return {
      name: apiState.name,
      code: apiState.code,
      geoJsonPath: `../../assets/maps/${apiState.name.toLowerCase().replace(/\s+/g, '')}-constituencies.json`,
      center: [defaultLng, defaultLat], // [longitude, latitude]
      zoom: defaultZoom,
      constituencies: apiState.constituencies_count,
      hasGeoJson: apiState.has_geojson,
    };
  };

  /**
   * Fetch states from API
   */
  const fetchStates = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const token = getAccessToken();

      if (!token) {
        throw new Error('No authentication token found. Please login.');
      }

      const response = await fetch(`${API_BASE_URL}/states/config/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized. Please login again.');
        }
        throw new Error(`Failed to fetch states: ${response.statusText}`);
      }

      const data: StatesApiResponse = await response.json();

      // Transform and index states by code
      const statesMap: Record<string, StateMapConfig> = {};
      data.states.forEach((apiState) => {
        const stateConfig = transformStateData(apiState);
        statesMap[apiState.code] = stateConfig;
      });

      setStates(statesMap);
      setLoading(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load states configuration';
      console.error('[useStatesConfig] Error:', errorMessage);
      setError(errorMessage);
      setLoading(false);
    }
  }, []);

  /**
   * Get state configuration by state code
   */
  const getStateByCode = useCallback(
    (code: string): StateMapConfig | null => {
      if (!code) return null;
      return states[code.toUpperCase()] || null;
    },
    [states]
  );

  /**
   * Get state configuration by state name
   */
  const getStateByName = useCallback(
    (name: string): StateMapConfig | null => {
      if (!name) return null;
      const entry = Object.values(states).find(
        (state) => state.name.toLowerCase() === name.toLowerCase()
      );
      return entry || null;
    },
    [states]
  );

  // Fetch states on mount
  useEffect(() => {
    fetchStates();
  }, [fetchStates]);

  return {
    states,
    loading,
    error,
    refetch: fetchStates,
    getStateByCode,
    getStateByName,
  };
}
