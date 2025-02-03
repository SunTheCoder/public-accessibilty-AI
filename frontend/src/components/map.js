"use client";

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet'; // Import Leaflet to fix marker icon paths
import 'leaflet/dist/leaflet.css';
import { supabase } from '../../supabase';
import EditStationForm from './editStationComponent'; // Ensure the path is correct
import { getRoute } from '../lib/routingService';
import RouteInfo from './RouteInfo';  // Add this import

// Fix default icon paths
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
});

// This component handles route display
function RouteLayer({ routeGeometry }) {
  const map = useMap();

  useEffect(() => {
    if (!routeGeometry) return;

    const routeLayer = L.geoJSON(routeGeometry, {
      style: {
        color: '#3b82f6',
        weight: 4,
        opacity: 0.7
      }
    }).addTo(map);

    // Fit map to route bounds
    map.fitBounds(routeLayer.getBounds(), { padding: [50, 50] });

    return () => {
      map.removeLayer(routeLayer);
    };
  }, [map, routeGeometry]);

  return null;
}

const Map = () => {
  const [stations, setStations] = useState([]);
  const [selectedStations, setSelectedStations] = useState([]);
  const [route, setRoute] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);  // Add this state

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

  const handleStationClick = async (station) => {
    const newSelected = [...selectedStations];
    
    if (newSelected.length === 2) {
      // Reset selection if we already have two points
      newSelected.length = 0;
      setRouteInfo(null);  // Clear route info
    }
    
    newSelected.push(station);
    setSelectedStations(newSelected);

    // If we have two points, get the route
    if (newSelected.length === 2) {
      try {
        const routeData = await getRoute(
          [newSelected[0].longitude, newSelected[0].latitude],
          [newSelected[1].longitude, newSelected[1].latitude]
        );
        setRoute(routeData.geometry);
        setRouteInfo({
          distance: routeData.distance,
          duration: routeData.duration
        });
      } catch (error) {
        alert('Error finding route between stations');
        setSelectedStations([]);
        setRoute(null);
        setRouteInfo(null);
      }
    }
  };

  const handleCloseRouteInfo = () => {
    setRouteInfo(null);
    setRoute(null);
    setSelectedStations([]);
  };

  return (
    <div className="flex h-screen w-full relative">
      {routeInfo && (
        <RouteInfo 
          distance={routeInfo.distance}
          duration={routeInfo.duration}
          onClose={handleCloseRouteInfo}
        />
      )}
      <MapContainer center={[37.5532, -77.3832]} zoom={13} className="flex-1">
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {stations.map((station) => (
          <Marker
            key={station.id}
            position={[station.latitude, station.longitude]}
            eventHandlers={{
              click: () => handleStationClick(station)
            }}
          >
            <Popup>
              <div>
                <h3 className="font-bold">{station.name}</h3>
                <p>
                  {selectedStations.includes(station) 
                    ? `Selected (${selectedStations.indexOf(station) + 1}/2)`
                    : 'Click to select'}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
        {route && <RouteLayer routeGeometry={route} />}
      </MapContainer>
    </div>
  );
};

export default Map;
