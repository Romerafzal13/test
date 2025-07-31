// CountryMap.jsx
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import React, {  useEffect } from 'react';
import L from 'leaflet';




function FlyTo({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) {
      map.flyTo([lat, lng], 5, { duration: 2 });
    }
  }, [lat, lng, map]);
  return null;
}


const customIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  shadowSize: [41, 41],
});




function CountryMap({ lat, lng }) {
  return (
    <MapContainer
      center={[lat, lng]}
      zoom={3}
      style={{ height: '350px', width: '50%',borderRadius: '10px',position: 'relative', margin: '0 auto' }}
      scrollWheelZoom={false}
    >
 <TileLayer
  url="https://basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
  attribution="&copy; Carto"
  />
      <FlyTo lat={lat} lng={lng} />
      <Marker position={[lat, lng]} icon={customIcon} />
    </MapContainer>
  );
}

export default CountryMap;