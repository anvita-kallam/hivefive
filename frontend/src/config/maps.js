// Google Maps API Configuration
export const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "AIzaSyChjQubjJduS4Gcu3CAs42wZK-trub-pCM";

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

