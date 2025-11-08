import { createContext, useContext, useState, useEffect } from 'react';
import { LoadScript } from '@react-google-maps/api';
import { GOOGLE_MAPS_API_KEY } from '../config/maps';

const GoogleMapsContext = createContext({ 
  isLoaded: false, 
  loadError: null,
  google: null 
});

export const useGoogleMaps = () => {
  return useContext(GoogleMapsContext);
};

export const GoogleMapsProvider = ({ children }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [google, setGoogle] = useState(null);

  const handleLoad = () => {
    // Wait a bit to ensure the API is fully initialized
    // Check multiple times to ensure the API is ready
    let retries = 0;
    const maxRetries = 20; // Maximum 1 second of retries (20 * 50ms)
    
    const checkGoogleMaps = () => {
      if (window.google && window.google.maps && window.google.maps.Map) {
        setIsLoaded(true);
        setGoogle(window.google);
      } else if (retries < maxRetries) {
        retries++;
        // Retry after a short delay if not ready
        setTimeout(checkGoogleMaps, 50);
      } else {
        // If we've exhausted retries, set an error
        console.warn('Google Maps API took too long to initialize');
        setLoadError(new Error('Google Maps API initialization timeout'));
      }
    };
    
    // Start checking after a small delay
    setTimeout(checkGoogleMaps, 100);
  };

  const handleError = (error) => {
    console.error('Google Maps API load error:', error);
    setLoadError(error);
  };

  // Also check if Google Maps is already loaded (e.g., from a previous load)
  useEffect(() => {
    if (window.google && window.google.maps && window.google.maps.Map && !isLoaded) {
      setIsLoaded(true);
      setGoogle(window.google);
    }
  }, [isLoaded]);

  return (
    <LoadScript
      googleMapsApiKey={GOOGLE_MAPS_API_KEY}
      libraries={['places']}
      onLoad={handleLoad}
      onError={handleError}
      loadingElement={<div>Loading Google Maps...</div>}
    >
      <GoogleMapsContext.Provider value={{ isLoaded, loadError, google }}>
        {children}
      </GoogleMapsContext.Provider>
    </LoadScript>
  );
};

