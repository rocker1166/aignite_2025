// src/components/SimulationToolbar.tsx
import { FC } from 'react';

interface SimulationToolbarProps {
  selectedSupplyChain: string;
  setSelectedSupplyChain: (id: string) => void;
  onSave: () => void;
  onRun: () => void;
  onExport: () => void;
  simulationMode: boolean;
  setSimulationMode: (mode: boolean) => void;
}

const SimulationToolbar: FC<SimulationToolbarProps> = ({
  selectedSupplyChain,
  setSelectedSupplyChain,
  onSave,
  onRun,
  onExport,
  simulationMode,
  setSimulationMode
}) => {
  const supplyChainOptions = [
    { id: 'default-chain', label: 'Default Supply Chain' },
    { id: 'electronics-chain', label: 'Electronics Supply Chain' },
    { id: 'automotive-chain', label: 'Automotive Supply Chain' }
  ];

  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-200">
      <div className="flex items-center space-x-4">
        <h1 className="text-xl font-semibold">Digital Twin</h1>
        
        <select
            title='Supply Chain'
          value={selectedSupplyChain}
          onChange={(e) => setSelectedSupplyChain(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2"
        >
          {supplyChainOptions.map(option => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      
      <div className="flex items-center space-x-2">
        {simulationMode && (
          <button
            onClick={() => setSimulationMode(false)}
            className="px-4 py-2 0 text-gray-800 rounded hover:bg-gray-300"
          >
            Exit Simulation
          </button>
        )}
        
        <button
          onClick={onSave}
          disabled={simulationMode}
          className={`px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 ${
            simulationMode ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          Save
        </button>
        
        <button
          onClick={onRun}
          disabled={simulationMode}
          className={`px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 ${
            simulationMode ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          Run Simulation
        </button>
        
        <button
          onClick={onExport}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
        >
          Export
        </button>
      </div>
    </div>
  );
};

export default SimulationToolbar;