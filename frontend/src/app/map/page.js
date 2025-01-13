"use client";

import dynamic from 'next/dynamic';

const Map = dynamic(() => import('../../components/map'), { ssr: false });

export default function MapPage() {
  return (
    <main>
      <h1>Public Transit Accessibility</h1>
      <Map />
    </main>
  );
}
