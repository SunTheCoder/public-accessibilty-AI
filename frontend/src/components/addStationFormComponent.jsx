"use client";

import { useState } from 'react';
import { supabase } from '../../supabase';

const AddStationForm = () => {
  const [name, setName] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [isAccessible, setIsAccessible] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { data, error } = await supabase.from('stations').insert([
      {
        name,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        is_accessible: isAccessible,
      },
    ]);

    if (error) {
      console.error('Error adding station:', error.message);
    } else {
      console.log('Station added:', data);
      setName('');
      setLatitude('');
      setLongitude('');
      setIsAccessible(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-lg max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Add a New Spot</h2>
      
      <label className="block mb-2">
        <span className="text-gray-700">Spot Name:</span>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        />
      </label>

      <label className="block mb-2">
        <span className="text-gray-700">Latitude:</span>
        <input
          type="number"
          step="any"
          value={latitude}
          onChange={(e) => setLatitude(e.target.value)}
          className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        />
      </label>

      <label className="block mb-2">
        <span className="text-gray-700">Longitude:</span>
        <input
          type="number"
          step="any"
          value={longitude}
          onChange={(e) => setLongitude(e.target.value)}
          className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        />
      </label>

      <label className="flex items-center mb-4">
        <input
          type="checkbox"
          checked={isAccessible}
          onChange={(e) => setIsAccessible(e.target.checked)}
          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <span className="ml-2 text-gray-700">Accessible</span>
      </label>

      <button
        type="submit"
        className="w-full bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-600"
      >
        Add Spot
      </button>
    </form>
  );
};

export default AddStationForm;
