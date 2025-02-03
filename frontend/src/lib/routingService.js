import { calculateOfflineRoute } from './offlineRouting';

const OSRM_API_URL = 'https://router.project-osrm.org/route/v1';

export const getRoute = async (startCoords, endCoords, mode = 'walking') => {
  if (!navigator.onLine) {
    return calculateOfflineRoute(startCoords, endCoords);
  }

  try {
    const response = await fetch(
      `${OSRM_API_URL}/${mode}/${startCoords[0]},${startCoords[1]};${endCoords[0]},${endCoords[1]}?overview=full&geometries=geojson&alternatives=3`
    );
    const data = await response.json();
    
    if (data.code !== 'Ok') {
      throw new Error('Unable to find route');
    }

    return {
      geometry: data.routes[0].geometry,
      distance: data.routes[0].distance,
      duration: data.routes[0].duration,
      alternatives: data.routes.slice(1).map(route => ({
        geometry: route.geometry,
        distance: route.distance,
        duration: route.duration
      }))
    };
  } catch (error) {
    console.error('Error fetching route, falling back to offline routing:', error);
    return calculateOfflineRoute(startCoords, endCoords);
  }
}; 