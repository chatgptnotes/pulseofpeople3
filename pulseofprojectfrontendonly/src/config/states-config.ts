/**
 * State Configuration for Dynamic Maps
 *
 * This file contains metadata for all Indian states supported in the system.
 * Each state has its own map configuration including GeoJSON path, center coordinates,
 * zoom level, and constituency count.
 */

export interface StateMapConfig {
  name: string;
  code: string;
  geoJsonPath: string;
  center: [number, number]; // [longitude, latitude]
  zoom: number;
  constituencies: number;
  hasGeoJson: boolean; // Whether GeoJSON file exists
}

export const STATE_MAP_CONFIG: Record<string, StateMapConfig> = {
  // Tamil Nadu - Has complete GeoJSON data
  TN: {
    name: 'Tamil Nadu',
    code: 'TN',
    geoJsonPath: '../../assets/maps/tamilnadu-constituencies.json',
    center: [78.6569, 11.1271],
    zoom: 6.5,
    constituencies: 234,
    hasGeoJson: true,
  },

  // Maharashtra - Add GeoJSON file to enable map
  MH: {
    name: 'Maharashtra',
    code: 'MH',
    geoJsonPath: '../../assets/maps/maharashtra-constituencies.json',
    center: [75.7139, 19.7515],
    zoom: 6.0,
    constituencies: 288,
    hasGeoJson: false, // Set to true after adding GeoJSON file
  },

  // Delhi - Add GeoJSON file to enable map
  DL: {
    name: 'Delhi',
    code: 'DL',
    geoJsonPath: '../../assets/maps/delhi-constituencies.json',
    center: [77.1025, 28.7041],
    zoom: 10.0,
    constituencies: 70,
    hasGeoJson: false, // Set to true after adding GeoJSON file
  },

  // Punjab - Add GeoJSON file to enable map
  PB: {
    name: 'Punjab',
    code: 'PB',
    geoJsonPath: '../../assets/maps/punjab-constituencies.json',
    center: [75.3412, 31.1471],
    zoom: 7.0,
    constituencies: 117,
    hasGeoJson: false, // Set to true after adding GeoJSON file
  },

  // Uttar Pradesh - Add GeoJSON file to enable map
  UP: {
    name: 'Uttar Pradesh',
    code: 'UP',
    geoJsonPath: '../../assets/maps/uttarpradesh-constituencies.json',
    center: [80.9462, 26.8467],
    zoom: 6.0,
    constituencies: 403,
    hasGeoJson: false, // Set to true after adding GeoJSON file
  },

  // Karnataka - Add GeoJSON file to enable map
  KA: {
    name: 'Karnataka',
    code: 'KA',
    geoJsonPath: '../../assets/maps/karnataka-constituencies.json',
    center: [76.6394, 15.3173],
    zoom: 6.5,
    constituencies: 224,
    hasGeoJson: false, // Set to true after adding GeoJSON file
  },

  // Gujarat - Add GeoJSON file to enable map
  GJ: {
    name: 'Gujarat',
    code: 'GJ',
    geoJsonPath: '../../assets/maps/gujarat-constituencies.json',
    center: [71.1924, 22.2587],
    zoom: 6.5,
    constituencies: 182,
    hasGeoJson: false, // Set to true after adding GeoJSON file
  },

  // West Bengal - Add GeoJSON file to enable map
  WB: {
    name: 'West Bengal',
    code: 'WB',
    geoJsonPath: '../../assets/maps/westbengal-constituencies.json',
    center: [87.8550, 22.9868],
    zoom: 7.0,
    constituencies: 294,
    hasGeoJson: false, // Set to true after adding GeoJSON file
  },

  // Rajasthan - Add GeoJSON file to enable map
  RJ: {
    name: 'Rajasthan',
    code: 'RJ',
    geoJsonPath: '../../assets/maps/rajasthan-constituencies.json',
    center: [74.2179, 27.0238],
    zoom: 6.0,
    constituencies: 200,
    hasGeoJson: false, // Set to true after adding GeoJSON file
  },

  // Madhya Pradesh - Add GeoJSON file to enable map
  MP: {
    name: 'Madhya Pradesh',
    code: 'MP',
    geoJsonPath: '../../assets/maps/madhyapradesh-constituencies.json',
    center: [78.6569, 22.9734],
    zoom: 6.0,
    constituencies: 230,
    hasGeoJson: false, // Set to true after adding GeoJSON file
  },
};

/**
 * Get state configuration by state code
 * Returns Tamil Nadu config as fallback if state not found
 */
export function getStateConfig(stateCode: string | undefined): StateMapConfig {
  if (!stateCode) {
    return STATE_MAP_CONFIG.TN; // Default fallback
  }

  const config = STATE_MAP_CONFIG[stateCode.toUpperCase()];
  return config || STATE_MAP_CONFIG.TN; // Fallback to Tamil Nadu if not found
}

/**
 * Get state configuration by state name
 */
export function getStateConfigByName(stateName: string | undefined): StateMapConfig {
  if (!stateName) {
    return STATE_MAP_CONFIG.TN;
  }

  const entry = Object.values(STATE_MAP_CONFIG).find(
    config => config.name.toLowerCase() === stateName.toLowerCase()
  );

  return entry || STATE_MAP_CONFIG.TN;
}
