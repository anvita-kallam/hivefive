import { useMemo } from 'react';
import { GoogleMap, Marker } from '@react-google-maps/api';
import { useGoogleMaps } from '../contexts/GoogleMapsContext';
import { defaultMapOptions } from '../config/maps';

const MapContainer = ({ location, markers = [], height = '400px', width = '100%' }) => {
  const { isLoaded, loadError } = useGoogleMaps();
  const mapCenter = useMemo(() => {
    if (location?.coordinates) {
      return {
        lat: location.coordinates[1],
        lng: location.coordinates[0]
      };
    }
    return defaultMapOptions.center;
  }, [location]);

  const mapOptions = useMemo(() => ({
    ...defaultMapOptions,
    center: mapCenter
  }), [mapCenter]);

  if (loadError) {
    return <div className="text-red-500">Error loading Google Maps: {loadError.message}</div>;
  }

  // Check both isLoaded from context and window.google availability
  if (!isLoaded || !window.google || !window.google.maps || !window.google.maps.Map) {
    return (
      <div className="flex items-center justify-center" style={{ height, width }}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <p className="ml-3 text-gray-600">Loading Google Maps...</p>
      </div>
    );
  }

  return (
    <GoogleMap
        mapContainerStyle={{ height, width }}
        zoom={mapOptions.zoom}
        center={mapCenter}
        options={mapOptions}
      >
        {/* Main location marker */}
        {location?.coordinates && (
          <Marker
            position={{
              lat: location.coordinates[1],
              lng: location.coordinates[0]
            }}
            title={location.name || location.address}
          />
        )}
        
        {/* Additional markers */}
        {markers.map((marker, index) => (
          <Marker
            key={index}
            position={{
              lat: marker.lat,
              lng: marker.lng
            }}
            title={marker.title}
            label={marker.label}
          />
        ))}
    </GoogleMap>
  );
};

export default MapContainer;

