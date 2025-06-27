import { FC, useState, useEffect } from 'react';
import { useQueryState, parseAsString } from 'nuqs';
import SaveSupplyChainDialog from '../forms/SaveSupplyChainDialog';
import IntelligenceAnalysisDialog from '../IntelligenceAnalysisDialog';
import FloatingSaveButton from './FloatingSaveButton';
import { Node, Edge } from 'reactflow';

interface SimulationToolbarProps {
  selectedSupplyChain: string;
  setSelectedSupplyChain: (id: string) => void;
  onSave: () => Promise<string | null>;
  simulationMode: boolean;
  setSimulationMode: (mode: boolean) => void;
  supplyChainName?: string;
  setSupplyChainName?: (name: string) => void;
  description?: string;
  setDescription?: (desc: string) => void;
  nodes: Node[];
  edges: Edge[];
  /** When true the toolbar is rendered in read-only mode and will hide all mutation actions */
  viewOnly?: boolean;
}

const SimulationToolbar: FC<SimulationToolbarProps> = ({
  selectedSupplyChain,
  setSelectedSupplyChain,
  onSave,
  simulationMode,
  setSimulationMode,
  supplyChainName,
  setSupplyChainName,
  description,
  setDescription,
  nodes,
  edges,
  viewOnly = false,
}) => {
  // In view-only mode, hide the toolbar completely (no Save/Intelligence buttons)
  if (viewOnly) {
    return null;
  }

  // Check for URL parameters to detect if save dialog was previously opened
  const [nameParam] = useQueryState('saveName', parseAsString);
  const [descriptionParam] = useQueryState('saveDescription', parseAsString);
  
  const [inputValue, setInputValue] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isAnalysisDialogOpen, setIsAnalysisDialogOpen] = useState(false);
  const [analysisSupplyChainId, setAnalysisSupplyChainId] = useState<string | null>(null);

  // Initialize input value with the label corresponding to the selected supply chain
  useEffect(() => {
    const supplyChainOptions = {
      'default-chain': 'Default Supply Chain',
      'electronics-chain': 'Electronics Supply Chain',
      'automotive-chain': 'Automotive Supply Chain'
    };

    const defaultName = supplyChainOptions[selectedSupplyChain as keyof typeof supplyChainOptions] || selectedSupplyChain;
    setInputValue(defaultName);
    
    // If there are URL params for save data, prioritize those, otherwise use current state or default
    const finalName = nameParam || supplyChainName || defaultName;
    const finalDescription = descriptionParam || description || '';
    
    if (setSupplyChainName && supplyChainName !== finalName) {
      setSupplyChainName(finalName);
    }
    if (setDescription && description !== finalDescription) {
      setDescription(finalDescription);
    }
  }, [selectedSupplyChain, setSupplyChainName, setDescription, nameParam, descriptionParam, supplyChainName, description]);

  // Listen for global "supply_chain_saved" events (dispatched by performSave)
  useEffect(() => {
    const handler = (event: Event) => {
      const customEvent = event as CustomEvent<{ supplyChainId?: string }>;
      const id = customEvent.detail?.supplyChainId;
      if (id) {
        setAnalysisSupplyChainId(id);
        setIsDialogOpen(false); // ensure save dialog closes if still open
      }
    };

    window.addEventListener('supply_chain_saved', handler as EventListener);
    return () => {
      window.removeEventListener('supply_chain_saved', handler as EventListener);
    };
  }, []);

  // NEW: Open the analysis dialog automatically when a valid supply chain id is available
  useEffect(() => {
    if (analysisSupplyChainId) {
      setIsAnalysisDialogOpen(true);
    }
  }, [analysisSupplyChainId]);

  

  // Handle save button click - opens dialog
  const handleSaveClick = () => {
    setIsDialogOpen(true);
  };

  // Handle actual save from dialog
  const handleSaveSupplyChain = async (name: string, desc: string) => {
    console.log('🔍 [Toolbar] handleSaveSupplyChain called with:', {
      name,
      desc,
      nameLength: name?.length,
      descLength: desc?.length
    });
    
    console.log('🔍 [Toolbar] Current nodes/edges state:', {
      nodesCount: nodes?.length || 0,
      edgesCount: edges?.length || 0,
      nodesType: Array.isArray(nodes),
      edgesType: Array.isArray(edges)
    });
    
    console.log('🔍 [Toolbar] Sample nodes data:', nodes?.slice(0, 2));
    console.log('🔍 [Toolbar] Sample edges data:', edges?.slice(0, 2));
    
    setIsSaving(true);
    try {
      console.log('🔍 [Toolbar] Updating local state...');
      // Update local state
      if (setSupplyChainName) {
        console.log('🔍 [Toolbar] Setting supply chain name:', name);
        setSupplyChainName(name);
      }
      if (setDescription) {
        console.log('🔍 [Toolbar] Setting description:', desc);
        setDescription(desc);
      }
      console.log('🔍 [Toolbar] Setting input value:', name);
      setInputValue(name);
      
      console.log('🚀 [Toolbar] About to call onSave function...');
      // Call the original save function and retrieve the generated supply chain ID
      const supplyChainId = await onSave();
      console.log('✅ [Toolbar] onSave completed, returned ID:', supplyChainId);

      // If the backend returned a valid ID, store it so the effect can trigger
      // and close the save dialog.
      if (supplyChainId) {
        console.log('🔍 [Toolbar] Setting analysis supply chain ID:', supplyChainId);
        setAnalysisSupplyChainId(supplyChainId);
        setIsDialogOpen(false);
      } else {
        console.warn('⚠️ [Toolbar] onSave returned falsy ID:', supplyChainId);
      }
    } catch (error) {
      console.error('❌ [Toolbar] Error saving supply chain:', error);
      console.error('❌ [Toolbar] Error details:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : typeof error
      });
      throw error; // Re-throw to let dialog handle the error
    } finally {
      console.log('🔍 [Toolbar] Save process finished, setting saving to false');
      setIsSaving(false);
    }
  };

  return (
    <>
      {/* Floating Save Button - always visible */}
      <FloatingSaveButton 
        onSave={handleSaveClick}
        disabled={simulationMode}
        isLoading={isSaving}
      />

      {/* Save Dialog */}
      <SaveSupplyChainDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleSaveSupplyChain}
        initialName={supplyChainName || inputValue}
        initialDescription={description || ''}
        nodes={nodes}
        edges={edges}
      />
      <IntelligenceAnalysisDialog
        isOpen={isAnalysisDialogOpen}
        onClose={() => setIsAnalysisDialogOpen(false)}
        supplyChainId={analysisSupplyChainId}
      />
    </>
  );
};

export default SimulationToolbar; 