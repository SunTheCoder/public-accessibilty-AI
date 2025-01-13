"use client";

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet'; // Import Leaflet to fix marker icon paths
import 'leaflet/dist/leaflet.css';
import { supabase } from '../../supabase';
import EditStationForm from './editStationComponent'; // Ensure the path is correct

// Fix default icon paths
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
});

const Map = () => {
  const [stations, setStations] = useState([]);
  const [selectedStation, setSelectedStation] = useState(null); // Track selected station for editing

  useEffect(() => {
    const fetchStations = async () => {
      const { data, error } = await supabase.from('stations').select('*');
      if (error) {
        console.error('Error fetching stations:', error.message);
      } else {
        setStations(data);
      }
    };

    fetchStations();
  }, []);

  const position = [37.534184, -77.429563];

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100%' }}>
      <MapContainer center={position} zoom={13} style={{ flex: 1 }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {stations.map((station) => (
          <Marker
            key={station.id}
            position={[station.latitude, station.longitude]}
            eventHandlers={{
              click: () => setSelectedStation(station), // Set selected station on marker click
            }}
          >
            <Popup>
              <strong>{station.name}</strong>
              <br />
              Accessible: {station.is_accessible ? 'Yes' : 'No'}
              <br />
              <button onClick={() => setSelectedStation(station)}>Edit</button>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Render EditStationForm if a station is selected */}
      {selectedStation && (
        <div style={{ width: '300px', padding: '1rem', backgroundColor: '#f4f4f4' }}>
          <h2>Edit Station</h2>
          <EditStationForm station={selectedStation} />
          <button onClick={() => setSelectedStation(null)}>Close</button>
        </div>
      )}
    </div>
  );
};

export default Map;
