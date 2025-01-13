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

  // Fetch stations from Supabase
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

    // Listen for realtime updates
    const stationSubscription = supabase
    .channel('realtime:stations')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'stations' },
      (payload) => {
        console.log('Station change received!', payload);
        handleRealtimeUpdate(payload);
      }
    )
    .subscribe();

  const updatesSubscription = supabase
    .channel('realtime:accessibility_updates')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'accessibility_updates' },
      (payload) => {
        console.log('Accessibility update received!', payload);
        handleRealtimeUpdate(payload); // Update the map or display the update
      }
    )
    .subscribe();

  const issuesSubscription = supabase
    .channel('realtime:real_time_issues')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'real_time_issues' },
      (payload) => {
        console.log('Real-time issue received!', payload);
        handleRealtimeUpdate(payload); // Display the issue on the map or list
      }
    )
    .subscribe();

  // Cleanup all subscriptions on component unmount
  return () => {
    supabase.removeChannel(stationSubscription);
    supabase.removeChannel(updatesSubscription);
    supabase.removeChannel(issuesSubscription);
    };
  }, []);

  // Handle realtime updates
  const handleRealtimeUpdate = (payload) => {
    const { eventType, new: newStation, old: oldStation } = payload;

    if (eventType === 'INSERT') {
      setStations((prev) => [...prev, newStation]);
    } else if (eventType === 'UPDATE') {
      setStations((prev) =>
        prev.map((station) => (station.id === newStation.id ? newStation : station))
      );
    } else if (eventType === 'DELETE') {
      setStations((prev) => prev.filter((station) => station.id !== oldStation.id));
    }
  };

  const position = [37.534184, -77.429563];

  return (
    <div className="flex h-screen w-full">
      <MapContainer center={position} zoom={13} className="flex-1">
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
              <div className="text-center">
                <strong>{station.name}</strong>
                <br />
                Accessible: {station.is_accessible ? 'Yes' : 'No'}
                <br />
                
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {selectedStation && (
         <div className="w-80 p-4 bg-white shadow-lg border-l">
         <h2 className="text-xl font-semibold mb-4">Edit Station</h2>
         <EditStationForm station={selectedStation} />
         <button
           className="mt-4 w-20 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
           onClick={() => setSelectedStation(null)}
         >
           Close
         </button>
       </div>
      )}
    </div>
  );
};

export default Map;
