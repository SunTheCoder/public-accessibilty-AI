import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.css';
import { supabase } from '../../supabase';

const ObstacleDrawer = ({ onObstacleCreated }) => {
  const map = useMap();

  useEffect(() => {
    // Initialize draw controls
    const drawControl = new L.Control.Draw({
      draw: {
        marker: false,
        circlemarker: false,
        polyline: false,
        circle: false,
        polygon: {
          allowIntersection: false,
          drawError: {
            color: '#e1e100',
            message: '<strong>Cannot draw intersecting obstacles!</strong>'
          },
          shapeOptions: {
            color: '#ff0000',
            fillOpacity: 0.3
          }
        },
        rectangle: {
          shapeOptions: {
            color: '#ff0000',
            fillOpacity: 0.3
          }
        }
      }
    });

    map.addControl(drawControl);

    // Handle created obstacles
    const handleDrawCreated = async (e) => {
      const layer = e.layer;
      const geoJSON = layer.toGeoJSON();

      try {
        const description = prompt('Describe this obstacle:') || 'No description';
        
        const { data: user } = await supabase.auth.getUser();
        
        const { data, error } = await supabase
          .from('obstacles')
          .insert([{
            geometry: geoJSON,
            created_by: user?.user?.id,
            description: description
          }])
          .select()
          .single();

        if (error) throw error;

        layer.addTo(map);
        if (onObstacleCreated) onObstacleCreated(data);
      } catch (error) {
        console.error('Error saving obstacle:', error);
        alert('Failed to save obstacle');
      }
    };

    map.on(L.Draw.Event.CREATED, handleDrawCreated);

    return () => {
      map.removeControl(drawControl);
      map.off(L.Draw.Event.CREATED, handleDrawCreated);
    };
  }, [map, onObstacleCreated]);

  return null;
};

export default ObstacleDrawer; 