"use client";

import { useState } from 'react';
import { supabase } from '../../supabase';

const EditStationForm = ({ station }) => {
  const [name, setName] = useState(station.name);
  const [latitude, setLatitude] = useState(station.latitude);
  const [longitude, setLongitude] = useState(station.longitude);
  const [isAccessible, setIsAccessible] = useState(station.is_accessible);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { error } = await supabase
      .from('stations')
      .update({
        name,
        latitude,
        longitude,
        is_accessible: isAccessible,
      })
      .eq('id', station.id);

    if (error) {
      console.error('Error updating station:', error.message);
    } else {
      alert('Station updated successfully!');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 shadow rounded-md w-80 h-fit">
      <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-6">
        <div className="sm:col-span-2">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Station Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
        </div>

        <div>
          <label htmlFor="latitude" className="block text-sm font-medium text-gray-700">
            Latitude
          </label>
          <input
            id="latitude"
            type="number"
            step="any"
            value={latitude}
            onChange={(e) => setLatitude(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
        </div>

        <div>
          <label htmlFor="longitude" className="block text-sm font-medium text-gray-700">
            Longitude
          </label>
          <input
            id="longitude"
            type="number"
            step="any"
            value={longitude}
            onChange={(e) => setLongitude(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
        </div>
      </div>

      <div className="flex items-center">
        <input
          id="isAccessible"
          type="checkbox"
          checked={isAccessible}
          onChange={(e) => setIsAccessible(e.target.checked)}
          className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
        />
        <label htmlFor="isAccessible" className="ml-3 text-sm font-medium text-gray-700">
          Accessible
        </label>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Save Changes
        </button>
      </div>
    </form>
  );
};

export default EditStationForm;
