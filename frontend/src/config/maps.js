// Google Maps API Configuration
// Require environment variable - no hardcoded fallback for security
if (!import.meta.env.VITE_GOOGLE_MAPS_API_KEY) {
  throw new Error(
    'Missing required environment variable: VITE_GOOGLE_MAPS_API_KEY\n' +
    'Please create a .env.local file in the frontend directory with VITE_GOOGLE_MAPS_API_KEY.\n' +
    'See SETUP.md for details.'
  );
}

export const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

export const mapConfig = {
  center: {
    lat: 33.7756, // Georgia Tech coordinates
    lng: -84.3963
  },
  zoom: 15,
  mapTypeControl: true,
  streetViewControl: true,
  fullscreenControl: true
};

// Default map options for hive locations
export const defaultMapOptions = {
  ...mapConfig,
  zoom: 13
};

