import { createContext, useContext, useState, useEffect } from 'react';
import { LoadScript } from '@react-google-maps/api';
import { GOOGLE_MAPS_API_KEY } from '../config/maps';

// Define libraries array as a constant outside component to prevent re-renders
const GOOGLE_MAPS_LIBRARIES = ['places'];

const GoogleMapsContext = createContext({ 
  isLoaded: false, 
  loadError: null,
  google: null 
});

export const useGoogleMaps = () => {
  return useContext(GoogleMapsContext);
};

// Check if Google Maps script is already in the DOM
const isScriptInDOM = () => {
  const scripts = document.querySelectorAll('script[src*="maps.googleapis.com"]');
  return scripts.length > 0;
};

// Check if Google Maps API is fully loaded
const isGoogleMapsLoaded = () => {
  return window.google && window.google.maps && window.google.maps.Map;
};

export const GoogleMapsProvider = ({ children }) => {
  const [isLoaded, setIsLoaded] = useState(() => isGoogleMapsLoaded());
  const [loadError, setLoadError] = useState(null);
  const [google, setGoogle] = useState(() => (window.google || null));

  // Check if Google Maps is already loaded on mount and poll if script is in DOM
  useEffect(() => {
    if (isGoogleMapsLoaded() && window.google && window.google.maps && window.google.maps.Map && !isLoaded) {
      setIsLoaded(true);
      setGoogle(window.google);
      return;
    }

    // If script is in DOM but not loaded yet, poll until it loads
    if (isScriptInDOM() && !isGoogleMapsLoaded() && !isLoaded) {
      const checkInterval = setInterval(() => {
        if (isGoogleMapsLoaded() && window.google && window.google.maps && window.google.maps.Map) {
          setIsLoaded(true);
          setGoogle(window.google);
          clearInterval(checkInterval);
        }
      }, 100);

      // Clear after 5 seconds
      const timeout = setTimeout(() => {
        clearInterval(checkInterval);
        if (!isLoaded) {
          setLoadError(new Error('Google Maps API failed to load'));
        }
      }, 5000);

      return () => {
        clearInterval(checkInterval);
        clearTimeout(timeout);
      };
    }
  }, [isLoaded]);

  const handleLoad = () => {
    // Wait a bit to ensure the API is fully initialized
    // Check multiple times to ensure the API is ready
    let retries = 0;
    const maxRetries = 30; // Maximum 1.5 seconds of retries (30 * 50ms)
    
    const checkGoogleMaps = () => {
      if (isGoogleMapsLoaded() && window.google && window.google.maps && window.google.maps.Map) {
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

  // Always use LoadScript to ensure components have access to google object
  // LoadScript handles duplicate script loading internally
  return (
    <LoadScript
      googleMapsApiKey={GOOGLE_MAPS_API_KEY}
      libraries={['places']}
      onLoad={handleLoad}
      onError={handleError}
      loadingElement={<div>Loading Google Maps...</div>}
    >
      <GoogleMapsContext.Provider value={{ isLoaded, loadError, google: window.google || null }}>
        {children}
      </GoogleMapsContext.Provider>
    </LoadScript>
  );
};

