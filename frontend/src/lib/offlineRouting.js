import L from 'leaflet';

export const calculateOfflineRoute = (startPoint, endPoint, obstacles = []) => {
  // Simple direct line if no obstacles
  if (!obstacles.length) {
    return {
      geometry: {
        type: 'LineString',
        coordinates: [
          [startPoint[1], startPoint[0]],
          [endPoint[1], endPoint[0]]
        ]
      },
      distance: L.latLng(startPoint[0], startPoint[1])
        .distanceTo(L.latLng(endPoint[0], endPoint[1])),
      duration: null // Can't estimate accurately offline
    };
  }

  // Simple A* pathfinding if there are obstacles
  // ... (implementation from previous A* algorithm)
}; 