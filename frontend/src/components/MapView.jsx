import { useMemo } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { GOOGLE_MAPS_API_KEY, defaultMapOptions } from '../config/maps';

const MapContainer = ({ location, markers = [], height = '400px', width = '100%' }) => {
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

  return (
    <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY}>
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
    </LoadScript>
  );
};

export default MapContainer;

