import { useState, useRef } from 'react';
import { GoogleMap, LoadScript, Autocomplete, Marker } from '@react-google-maps/api';
import { GOOGLE_MAPS_API_KEY, defaultMapOptions } from '../config/maps';
import { MapPin } from 'lucide-react';

const libraries = ['places'];

function LocationPicker({ onLocationSelect, initialLocation = null }) {
  const [selectedLocation, setSelectedLocation] = useState(initialLocation);
  const [mapCenter, setMapCenter] = useState(
    initialLocation?.coordinates 
      ? { lat: initialLocation.coordinates[1], lng: initialLocation.coordinates[0] }
      : defaultMapOptions.center
  );
  const autocompleteRef = useRef(null);

  const onPlaceChanged = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      if (place.geometry) {
        const location = {
          name: place.name,
          address: place.formatted_address,
          coordinates: [place.geometry.location.lng(), place.geometry.location.lat()]
        };
        setSelectedLocation(location);
        setMapCenter({
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng()
        });
        if (onLocationSelect) {
          onLocationSelect(location);
        }
      }
    }
  };

  const onMapClick = (e) => {
    const location = {
      coordinates: [e.latLng.lng(), e.latLng.lat()],
      address: `${e.latLng.lat()}, ${e.latLng.lng()}`
    };
    setSelectedLocation(location);
    if (onLocationSelect) {
      onLocationSelect(location);
    }
  };

  return (
    <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY} libraries={libraries}>
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
    </LoadScript>
  );
}

export default LocationPicker;

