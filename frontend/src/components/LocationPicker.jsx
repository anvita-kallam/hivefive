import { useState, useRef } from 'react';
import { GoogleMap, Autocomplete, Marker } from '@react-google-maps/api';
import { useGoogleMaps } from '../contexts/GoogleMapsContext';
import { defaultMapOptions } from '../config/maps';
import { MapPin } from 'lucide-react';

function LocationPicker({ onLocationSelect, initialLocation = null }) {
  const { isLoaded, loadError } = useGoogleMaps();
  const [selectedLocation, setSelectedLocation] = useState(initialLocation);
  const [mapCenter, setMapCenter] = useState(
    initialLocation?.coordinates 
      ? { lat: initialLocation.coordinates[1], lng: initialLocation.coordinates[0] }
      : defaultMapOptions.center
  );
  const autocompleteRef = useRef(null);

  if (loadError) {
    return <div className="text-red-500">Error loading Google Maps: {loadError.message}</div>;
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const onPlaceChanged = () => {
    if (autocompleteRef.current && isLoaded) {
      try {
        const place = autocompleteRef.current.getPlace();
        if (place && place.geometry && place.geometry.location) {
          const lat = typeof place.geometry.location.lat === 'function' 
            ? place.geometry.location.lat() 
            : place.geometry.location.lat;
          const lng = typeof place.geometry.location.lng === 'function' 
            ? place.geometry.location.lng() 
            : place.geometry.location.lng;
          
          const location = {
            name: place.name || '',
            address: place.formatted_address || '',
            coordinates: [lng, lat]
          };
          setSelectedLocation(location);
          setMapCenter({ lat, lng });
          if (onLocationSelect) {
            onLocationSelect(location);
          }
        }
      } catch (error) {
        console.error('Error processing place:', error);
      }
    }
  };

  const onMapClick = (e) => {
    if (e.latLng && isLoaded) {
      try {
        const lat = typeof e.latLng.lat === 'function' ? e.latLng.lat() : e.latLng.lat;
        const lng = typeof e.latLng.lng === 'function' ? e.latLng.lng() : e.latLng.lng;
        const location = {
          coordinates: [lng, lat],
          address: `${lat}, ${lng}`,
          name: ''
        };
        setSelectedLocation(location);
        if (onLocationSelect) {
          onLocationSelect(location);
        }
      } catch (error) {
        console.error('Error processing map click:', error);
      }
    }
  };

  return (
    <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search Location
          </label>
          <Autocomplete
            onLoad={(autocomplete) => {
              autocompleteRef.current = autocomplete;
            }}
            onPlaceChanged={onPlaceChanged}
            options={{
              types: ['establishment', 'geocode'],
              componentRestrictions: { country: 'us' }
            }}
          >
            <input
              type="text"
              placeholder="Search for a location..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              defaultValue={selectedLocation?.name || selectedLocation?.address}
            />
          </Autocomplete>
        </div>

        <div className="border border-gray-300 rounded-lg overflow-hidden" style={{ height: '400px' }}>
          <GoogleMap
            mapContainerStyle={{ width: '100%', height: '100%' }}
            center={mapCenter}
            zoom={15}
            onClick={onMapClick}
            options={{
              ...defaultMapOptions,
              center: mapCenter
            }}
          >
            {selectedLocation?.coordinates && (
              <Marker
                position={{
                  lat: selectedLocation.coordinates[1],
                  lng: selectedLocation.coordinates[0]
                }}
                title={selectedLocation.name || selectedLocation.address}
              />
            )}
          </GoogleMap>
        </div>

        {selectedLocation && (
          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
            <MapPin className="w-5 h-5 text-primary-600" />
            <div>
              <p className="font-medium text-gray-900">
                {selectedLocation.name || 'Selected Location'}
              </p>
              {selectedLocation.address && (
                <p className="text-sm text-gray-600">{selectedLocation.address}</p>
              )}
            </div>
          </div>
        )}
      </div>
  );
}

export default LocationPicker;

