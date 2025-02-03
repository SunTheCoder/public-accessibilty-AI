"use client";

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet'; // Import Leaflet to fix marker icon paths
import 'leaflet/dist/leaflet.css';
import { supabase } from '../../supabase';
import EditStationForm from './editStationComponent'; // Ensure the path is correct
import { getRoute } from '../lib/routingService';
import RouteInfo from './RouteInfo';  // Add this import
import AddStationModal from './AddStationModal';
import { localStore } from '../lib/localStore';

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

// Add this component to display alternative routes
function AlternativeRoutesLayer({ routes, onSelectRoute }) {
  const map = useMap();

  useEffect(() => {
    if (!routes) return;

    const layers = routes.map((route, index) => {
      const layer = L.geoJSON(route.geometry, {
        style: {
          color: '#9333ea', // Purple color for alternative routes
          weight: 3,
          opacity: 0.5,
          dashArray: '5, 10' // Dashed line for alternatives
        }
      }).addTo(map);

      // Make alternative routes clickable
      layer.on('click', () => onSelectRoute(route, index));
      
      return layer;
    });

    return () => {
      layers.forEach(layer => map.removeLayer(layer));
    };
  }, [map, routes, onSelectRoute]);

  return null;
}

// Add this component to handle map clicks
function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click: (e) => {
      onMapClick([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
}

const Map = () => {
  const [stations, setStations] = useState([]);
  const [selectedStations, setSelectedStations] = useState([]);
  const [route, setRoute] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);  // Add this state
  const [alternativeRoutes, setAlternativeRoutes] = useState([]);
  const [newStationPosition, setNewStationPosition] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const fetchStations = async () => {
      // Get local stations first
      const localStations = await localStore.getStations();
      setStations(localStations);

      if (navigator.onLine) {
        // Then fetch from server if online
        const { data, error } = await supabase.from('stations').select('*');
        if (!error) {
          setStations(data);
        }
      }
    };

    fetchStations();

    // Add online/offline listeners
    const handleOnline = () => {
      setIsOnline(true);
      localStore.syncWithServer(); // Sync when coming back online
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
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
      newSelected.length = 0;
      setRouteInfo(null);
      setAlternativeRoutes([]);
    }
    
    newSelected.push(station);
    setSelectedStations(newSelected);

    if (newSelected.length === 2) {
      try {
        const routeData = await getRoute(
          [newSelected[0].longitude, newSelected[0].latitude],
          [newSelected[1].longitude, newSelected[1].latitude]
        );
        
        setRoute(routeData.geometry);
        setAlternativeRoutes(routeData.alternatives || []);
        setRouteInfo({
          distance: routeData.distance,
          duration: routeData.duration
        });
      } catch (error) {
        alert('Error finding route between stations');
        setSelectedStations([]);
        setRoute(null);
        setRouteInfo(null);
        setAlternativeRoutes([]);
      }
    }
  };

  const handleSelectAlternative = (route, index) => {
    setRoute(route.geometry);
    setRouteInfo({
      distance: route.distance,
      duration: route.duration,
      isAlternative: true,
      alternativeIndex: index + 1
    });
  };

  const handleCloseRouteInfo = () => {
    setRouteInfo(null);
    setRoute(null);
    setSelectedStations([]);
  };

  const handleMapClick = (position) => {
    setNewStationPosition(position);
  };

  const handleAddStation = (newStation) => {
    setStations(prev => [...prev, newStation]);
    setNewStationPosition(null);
  };

  // Add visual indicator for pending stations
  const getMarkerIcon = (station) => {
    return station.pending ? 
      new L.Icon({
        ...L.Icon.Default.prototype.options,
        className: 'pending-marker' // Add CSS for this
      }) :
      new L.Icon.Default();
  };

  return (
    <div className="flex h-screen w-full relative">
      {newStationPosition && (
        <AddStationModal
          position={newStationPosition}
          onSave={handleAddStation}
          onClose={() => setNewStationPosition(null)}
        />
      )}
      {routeInfo && (
        <RouteInfo 
          distance={routeInfo.distance}
          duration={routeInfo.duration}
          isAlternative={routeInfo.isAlternative}
          alternativeIndex={routeInfo.alternativeIndex}
          onClose={handleCloseRouteInfo}
        />
      )}
      <MapContainer center={[37.5532, -77.3832]} zoom={13} className="flex-1">
        <MapClickHandler onMapClick={handleMapClick} />
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {stations.map((station) => (
          <Marker
            key={station.id}
            position={[station.latitude, station.longitude]}
            icon={getMarkerIcon(station)}
            eventHandlers={{
              click: () => handleStationClick(station)
            }}
          >
            <Popup>
              <div>
                <h3 className="font-bold">{station.name}</h3>
                {station.pending && (
                  <p className="text-yellow-600 text-sm">Pending sync...</p>
                )}
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
        {alternativeRoutes.length > 0 && (
          <AlternativeRoutesLayer 
            routes={alternativeRoutes} 
            onSelectRoute={handleSelectAlternative}
          />
        )}
      </MapContainer>
    </div>
  );
};

export default Map;
