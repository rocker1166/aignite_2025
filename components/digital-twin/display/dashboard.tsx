"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import DigitalTwinCard from '@/components/digital-twin/display/digital-twin-card';
import { useQueryState, parseAsString } from 'nuqs';

// Mock data for initial development
const mockTwins = [
  {
    id: 'twin-1',
    name: 'North America Supply Chain',
    description: 'Manages all suppliers and factories in the NA region.',
    tags: ['Automotive', 'High Risk', 'Q3-2024'],
  },
  {
    id: 'twin-2',
    name: 'European Logistics Network',
    description: 'Focuses on the distribution and logistics for the EU market.',
    tags: ['Logistics', 'Low Risk', 'Q2-2024'],
  },
  {
    id: 'twin-3',
    name: 'APAC Manufacturing Hub',
    description: 'Coordinates manufacturing and assembly across Asia-Pacific.',
    tags: ['Manufacturing', 'Medium Risk', 'Q1-2024'],
  },
];

export default function DigitalTwinDashboard() {
  const [twins, setTwins] = useState(mockTwins);
  const [view, setView] = useQueryState('view', parseAsString);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <header className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold tracking-tight">My Digital Twins</h1>
        <Button onClick={() => setView('create')}>Create New Twin</Button>
      </header>
      <main>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {twins.map((twin) => (
            <DigitalTwinCard key={twin.id} twin={twin} />
          ))}
        </div>
      </main>
    </div>
  );
} 