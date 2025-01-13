"use client";

import { useState } from 'react';
import { supabase } from '../../supabase';

const EditStationForm = ({ station }) => {
  const [name, setName] = useState(station.name);
  const [latitude, setLatitude] = useState(station.latitude);
  const [longitude, setLongitude] = useState(station.longitude);
  const [isAccessible, setIsAccessible] = useState(station.is_accessible);

  const handleUpdate = async (e) => {
    e.preventDefault();

    const { data, error } = await supabase
      .from('stations')
      .update({
        name,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        is_accessible: isAccessible,
      })
      .eq('id', station.id);

    if (error) {
      console.error('Error updating station:', error.message);
    } else {
      console.log('Station updated:', data);
    }
  };

  return (
    <form onSubmit={handleUpdate}>
      <h2>Edit Station</h2>
      <label>
        Station Name:
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
      </label>
      <label>
        Latitude:
        <input type="number" step="any" value={latitude} onChange={(e) => setLatitude(e.target.value)} required />
      </label>
      <label>
        Longitude:
        <input type="number" step="any" value={longitude} onChange={(e) => setLongitude(e.target.value)} required />
      </label>
      <label>
        Accessible:
        <input type="checkbox" checked={isAccessible} onChange={(e) => setIsAccessible(e.target.checked)} />
      </label>
      <button type="submit">Update Station</button>
    </form>
  );
};

export default EditStationForm;
