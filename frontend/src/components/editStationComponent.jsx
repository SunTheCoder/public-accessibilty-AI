"use client";

import { useState, useEffect } from 'react';
import { supabase } from '../../supabase';

const EditStationForm = ({ station }) => {
  const [name, setName] = useState(station.name);
  const [latitude, setLatitude] = useState(station.latitude);
  const [longitude, setLongitude] = useState(station.longitude);
  const [isAccessible, setIsAccessible] = useState(station.is_accessible);

  const [realTimeIssues, setRealTimeIssues] = useState([]);
  const [newIssue, setNewIssue] = useState('');
  const [accessibilityUpdates, setAccessibilityUpdates] = useState([]);
  const [newUpdate, setNewUpdate] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const { data: issues } = await supabase
        .from('real_time_issues')
        .select('*')
        .eq('station_id', station.id);

      const { data: updates } = await supabase
        .from('accessibility_updates')
        .select('*')
        .eq('station_id', station.id);

      setRealTimeIssues(issues || []);
      setAccessibilityUpdates(updates || []);
    };

    fetchData();
  }, [station.id]);

  const handleSaveStation = async (e) => {
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

  const handleAddIssue = async (e) => {
    e.preventDefault();

    const { error, data } = await supabase
      .from('real_time_issues')
      .insert([{ description: newIssue, station_id: station.id }]);

    if (error) {
      console.error('Error adding issue:', error.message);
    } else {
      setRealTimeIssues([...realTimeIssues, data[0]]);
      setNewIssue('');
    }
  };

  const handleAddUpdate = async (e) => {
    e.preventDefault();

    const { error, data } = await supabase
      .from('accessibility_updates')
      .insert([{ update: newUpdate, station_id: station.id }]);

    if (error) {
      console.error('Error adding update:', error.message);
    } else {
      setAccessibilityUpdates([...accessibilityUpdates, data[0]]);
      setNewUpdate('');
    }
  };

  return (
    <div className="space-y-6 bg-white p-6 shadow rounded-md w-80 h-fit">
      <form onSubmit={handleSaveStation}>
        <h2 className="text-lg font-bold">Edit Station</h2>
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

        <button
          type="submit"
          className="mt-4 w-full inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Save Changes
        </button>
      </form>

      <div>
        <h3 className="text-lg font-bold mt-6">Real-Time Issues</h3>
        <ul className="space-y-2">
          {realTimeIssues.map((issue) => (
            <li key={issue.id} className="text-sm text-gray-700">
              {issue.description}
            </li>
          ))}
        </ul>
        <form onSubmit={handleAddIssue} className="mt-4">
          <label className="block text-sm font-medium text-gray-700">
            New Issue
          </label>
          <input
            type="text"
            value={newIssue}
            onChange={(e) => setNewIssue(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
          <button
            type="submit"
            className="mt-2 w-full bg-green-500 text-white font-bold py-2 px-4 rounded hover:bg-green-600"
          >
            Add Issue
          </button>
        </form>
      </div>

      <div>
        <h3 className="text-lg font-bold mt-6">Accessibility Updates</h3>
        <ul className="space-y-2">
          {accessibilityUpdates.map((update) => (
            <li key={update.id} className="text-sm text-gray-700">
              {update.update}
            </li>
          ))}
        </ul>
        <form onSubmit={handleAddUpdate} className="mt-4">
          <label className="block text-sm font-medium text-gray-700">
            New Update
          </label>
          <input
            type="text"
            value={newUpdate}
            onChange={(e) => setNewUpdate(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
          <button
            type="submit"
            className="mt-2 w-full bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-600"
          >
            Add Update
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditStationForm;
