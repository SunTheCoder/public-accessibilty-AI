"use client";

import dynamic from 'next/dynamic';
import { useState } from 'react';
import AddStationForm from '@/components/addStationFormComponent';

const Map = dynamic(() => import('../../components/map'), { ssr: false });

export default function MapPage() {
  const [showAddForm, setShowAddForm] = useState(false);

  return (
    <main className="relative h-screen">
      <div className="absolute top-4 right-4 z-50">
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow-lg"
        >
          {showAddForm ? 'Close Form' : 'Add Station'}
        </button>
        
        {showAddForm && (
          <div className="absolute right-0 mt-2 z-50 shadow-xl">
            <div className="bg-white rounded-lg shadow-lg">
              <AddStationForm />
            </div>
          </div>
        )}
      </div>

      <h1 className="text-2xl font-bold p-4 z-40 ml-10 relative">Our Spots</h1>
      <div className="absolute inset-0 z-0">
        <Map />
      </div>
    </main>
  );
}
