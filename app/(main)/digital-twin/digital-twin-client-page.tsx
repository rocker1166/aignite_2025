'use client';

import { useQueryState, parseAsString } from 'nuqs';
import DigitalTwinDashboard from '@/components/digital-twin/dashboard';
import CreationForm from '@/components/digital-twin/creation-form';
import DigitalTwinCanvas from '@/components/digital-twin/digital-twin-canvas';
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

  const handleCreationCancel = () => {
    setView(null, { scroll: false });
  };

  const handleCreationSuccess = (data: any) => {
    console.log('Supply chain created:', data);
    setView(null, { scroll: false });
    setTwinId('dummy-twin-id');
    // Here you would typically invalidate a query to refetch the twins list
  };

  // If a twinId is present, we would show the canvas/details view.
  if (twinId) {
    return <DigitalTwinCanvas />;
  }

  // The dashboard is always rendered, and the dialog is overlaid on top.
  return (
    <>
      <DigitalTwinDashboard />
      <Dialog
        open={view === 'create'}
        onOpenChange={(isOpen) => !isOpen && setView(null, { scroll: false })}
      >
        <DialogContent className="sm:max-w-[800px] p-0">
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