import React, { useState } from 'react';
import { supabase } from '../../supabase';
import { localStore } from '../lib/localStore';

const AddStationModal = ({ position, onSave, onClose }) => {
  const [name, setName] = useState('');
  const [isAccessible, setIsAccessible] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newStation = {
      name,
      latitude: position[0],
      longitude: position[1],
      is_accessible: isAccessible
    };

    try {
      if (navigator.onLine) {
        // Online: Try server first
        const { data, error } = await supabase
          .from('stations')
          .insert([newStation])
          .select()
          .single();

        if (error) throw error;
        onSave(data);
      } else {
        // Offline: Save locally
        const localData = await localStore.addStation(newStation);
        onSave({ ...localData, pending: true });
      }
      
      onClose();
    } catch (error) {
      console.error('Error adding station:', error);
      // On error, try to save locally
      try {
        const localData = await localStore.addStation(newStation);
        onSave({ ...localData, pending: true });
        onClose();
      } catch (localError) {
        alert('Failed to add station');
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center" style={{ zIndex: 1002 }}>
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Add Spot</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Spot Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isAccessible"
              checked={isAccessible}
              onChange={(e) => setIsAccessible(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isAccessible" className="ml-2 block text-sm text-gray-900">
              Accessible Spot
            </label>
          </div>

          <div className="text-sm text-gray-500">
            Position: {position[0].toFixed(6)}, {position[1].toFixed(6)}
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
            >
              Add Spot
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddStationModal; 