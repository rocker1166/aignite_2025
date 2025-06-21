'use client';

import { useState, useEffect } from 'react';
import { useQueryState, parseAsString } from 'nuqs';
import DigitalTwinDashboard from '@/components/digital-twin/dashboard';
import CreationForm from '@/components/digital-twin/creation-form';
import DigitalTwinCanvas from '@/components/digital-twin/digital-twin-canvas';
import { selectTemplate, getTemplateInfo } from '@/lib/template-selector';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

export default function DigitalTwinClientPage() {
  const [twinId, setTwinId] = useQueryState('twinId', parseAsString);
  const [view, setView] = useQueryState('view', parseAsString);
  const [archParam] = useQueryState('arch', parseAsString);
  const [activeTwinData, setActiveTwinData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load twin data when twinId changes
  useEffect(() => {
    if (twinId) {
      setIsLoading(true);
      
      // If there's an arch parameter, we'll let the canvas handle the state
      // Only load from localStorage if there's no arch parameter
      if (!archParam) {
        const data = localStorage.getItem(`supplyChain-${twinId}`);
        if (data) {
          try {
            const parsedData = JSON.parse(data);
            setActiveTwinData(parsedData);
          } catch (error) {
            console.error('Error parsing twin data:', error);
            setActiveTwinData(null);
          }
        } else {
          setActiveTwinData(null);
        }
      } else {
        // When arch param exists, set minimal twin data to indicate we have a twin
        // but let the canvas handle the actual node/edge state from the URL
        setActiveTwinData({ hasArchData: true });
      }
      setIsLoading(false);
    } else {
      setActiveTwinData(null);
      setIsLoading(false);
    }
  }, [twinId, archParam]);

  const handleCreationCancel = () => {
    setView(null, { scroll: false });
  };

  const handleCreationSuccess = (data: any) => {
    console.log('Supply chain created:', data);

    // Select the appropriate template based on form data
    const { nodes, edges } = selectTemplate(data);
    const templateInfo = getTemplateInfo(data);

    console.log(`Selected template: ${templateInfo.templateName} - ${templateInfo.reason}`);

    // Store the supply chain data with template nodes and edges in localStorage
    const twinId = `twin-${Date.now()}`;
    const twinData = {
      ...data,
      nodes,
      edges,
      templateInfo,
      createdAt: new Date().toISOString()
    };
    localStorage.setItem(`supplyChain-${twinId}`, JSON.stringify(twinData));

    // Store the list of twin IDs
    const existingTwins = JSON.parse(localStorage.getItem('digitalTwins') || '[]');
    const updatedTwins = [...existingTwins, {
      id: twinId,
      name: data.name || 'Unnamed Twin',
      createdAt: new Date().toISOString(),
      templateName: templateInfo.templateName
    }];
    localStorage.setItem('digitalTwins', JSON.stringify(updatedTwins));

    setView(null, { scroll: false });
    setTwinId(twinId);
    // Here you would typically invalidate a query to refetch the twins list
  };

  // If a twinId is present, we would show the canvas/details view.
  if (twinId) {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-lg text-gray-600">Loading digital twin...</p>
          </div>
        </div>
      );
    }

    if (activeTwinData) {
      // If we have arch data in URL, let the canvas handle state entirely
      if (activeTwinData.hasArchData) {
        return <DigitalTwinCanvas />;
      }
      
      // Otherwise, use the localStorage data if available
      if (activeTwinData.nodes && activeTwinData.edges) {
        return (
          <DigitalTwinCanvas
            initialNodes={activeTwinData.nodes}
            initialEdges={activeTwinData.edges}
          />
        );
      }
    }

    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-lg text-gray-600">Digital twin not found.</p>
          <button
            onClick={() => setTwinId(null)}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // The dashboard is always rendered, and the dialog is overlaid on top.
  return (
    <>
      <DigitalTwinDashboard />
      <Dialog
        open={view === 'create'}
        onOpenChange={(isOpen) => !isOpen && setView(null, { scroll: false })}
      >
        <DialogContent className="sm:max-w-[800px] p-0" hideCloseIcon={true}>
          <DialogHeader className="p-6 pb-2">
            <DialogTitle className="text-2xl font-bold">Create a New Digital Twin</DialogTitle>
            <DialogDescription>
              Fill out the steps below to build your supply chain model.
            </DialogDescription>
          </DialogHeader>
          <CreationForm
            onSuccess={handleCreationSuccess}
            onCancel={handleCreationCancel}
          />
        </DialogContent>
      </Dialog>
    </>
  );
} 