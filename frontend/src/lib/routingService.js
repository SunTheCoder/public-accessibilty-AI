const OSRM_API_URL = 'https://router.project-osrm.org/route/v1';

export const getRoute = async (startCoords, endCoords, mode = 'walking') => {
  try {
    const response = await fetch(
      `${OSRM_API_URL}/${mode}/${startCoords[0]},${startCoords[1]};${endCoords[0]},${endCoords[1]}?overview=full&geometries=geojson`
    );
    const data = await response.json();
    
    if (data.code !== 'Ok') {
      throw new Error('Unable to find route');
    }

    return {
      geometry: data.routes[0].geometry,
      distance: data.routes[0].distance,
      duration: data.routes[0].duration
    };
  } catch (error) {
    console.error('Error fetching route:', error);
    throw error;
  }
}; 